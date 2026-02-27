import type { Context } from './types'
import type { File as File_ } from '$lib/utils/types'

interface InitUploadRequest {
  context: Context
  files: {
    id: string
    path: string
    size: number
    sha256: string
    overwrite: boolean
  }[]
}

interface InitUploadResponse {
  results: {
    id: string
    status: 'ACCEPTED' | 'REJECTED'
    reason?: 'FILE_ALREADY_EXISTS' | 'LOCKED_BY_OTHER_USER' | 'FORBIDDEN_PATH' | 'QUOTA_EXCEEDED'
    uuid?: string
    token?: string
  }[]
}

interface CommitUploadRequest {
  uuid: string
  token: string
  context: Context
}

interface CommitUploadResponse {
  status: 'SUCCESS' | 'FAILURE'
  reason?: 'CHECKSUM_MISMATCH' | 'SIZE_MISMATCH' | 'FILE_NOT_FOUND' | 'SERVER_ERROR'
  file?: File_
}

interface UploadOptions {
  context: Context
  mode: 'BEST_EFFORT' | 'ALL_OR_NOTHING'
  currentPath: string
  promptOverwrite?: (fileName: string) => Promise<boolean>
  onProgress?: (fileName: string, progress: number) => void
  onFileComplete?: (newFile: File_) => Promise<void> | void
  onError?: (fileName: string, message: string) => void
}

interface FileIntention {
  id: string
  file: File
  path: string
  size: number
  sha256: string
  overwrite: boolean
}

export async function calculateSha256(file: File) {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

const CHUNK_SIZE = 5 * 1024 * 1024

export async function smartUpload(files: File[], options: UploadOptions): Promise<boolean> {
  if (!files.length) return true

  const intentions: FileIntention[] = await Promise.all(
    files.map(async (file, index) => ({
      id: `file-${index}-${Date.now()}`,
      file,
      path: `${options.currentPath}/${file.webkitRelativePath || file.name}`.replace(/^\/+/, ''),
      size: file.size,
      sha256: await calculateSha256(file),
      overwrite: options.mode === 'ALL_OR_NOTHING'
    }))
  )

  let approvedUploads = await performHandshake(intentions, options)

  if (approvedUploads === null) return false

  for (const upload of approvedUploads) {
    const success = await processUpload(upload.intention, upload.uuid, upload.token, options)

    if (!success && options.mode === 'ALL_OR_NOTHING') {
      options.onError?.(upload.intention.file.name, 'Error during upload. Aborting all uploads.')
      return false
    }
  }

  return true
}

async function performHandshake(intentions: FileIntention[], options: UploadOptions) {
  const payload: InitUploadRequest = {
    context: options.context,
    files: intentions.map(({ id, path, size, sha256, overwrite }) => ({
      id,
      path,
      size,
      sha256,
      overwrite
    }))
  }

  const res = await fetch('/api/upload/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    options.onError?.('Global', 'Failed to initiate upload session.')
    return null
  }

  const { results }: InitUploadResponse = await res.json()
  const approved: { intention: FileIntention; uuid: string; token: string }[] = []

  for (const result of results) {
    const intention = intentions.find((i) => i.id === result.id)!

    if (result.status === 'ACCEPTED') {
      approved.push({ intention, uuid: result.uuid!, token: result.token! })
    } else if (result.reason === 'FILE_ALREADY_EXISTS' && options.promptOverwrite) {
      const confirm = await options.promptOverwrite(intention.file.name)
      if (confirm) {
        intention.overwrite = true
        const retry = await performHandshake([intention], options)
        if (retry && retry.length > 0) approved.push(retry[0])
      }
    } else {
      options.onError?.(intention.file.name, `File rejected: ${result.reason}`)
      if (options.mode === 'ALL_OR_NOTHING') return null
    }
  }

  return approved
}

async function processUpload(intention: FileIntention, uuid: string, token: string, options: UploadOptions) {
  const { file } = intention
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    const res = await fetch('/api/upload/chunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Upload-UUID': uuid,
        'X-Upload-Token': token,
        'X-Upload-Context': options.context,
        'X-Chunk-Index': i.toString()
      },
      body: chunk
    })

    if (!res.ok) return false

    const progress = Math.round(((i + 1) / totalChunks) * 100)
    options.onProgress?.(file.name, progress)
  }

  const commitPayload: CommitUploadRequest = {
    uuid,
    token,
    context: options.context
  }

  const commitRes = await fetch('/api/upload/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commitPayload)
  })

  if (!commitRes.ok) return false

  const commitData: CommitUploadResponse = await commitRes.json()

  if (commitData.status === 'SUCCESS' && commitData?.file) {
    await options.onFileComplete?.(commitData.file)
  }

  return true
}

