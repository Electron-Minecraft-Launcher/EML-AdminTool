import { randomUUID, randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

interface InitUploadResponse {
  results: {
    id: string
    status: 'ACCEPTED' | 'REJECTED'
    reason?: 'FILE_ALREADY_EXISTS' | 'LOCKED_BY_OTHER_USER' | 'FORBIDDEN_PATH' | 'QUOTA_EXCEEDED'
    uuid?: string
    token?: string
  }[]
}

interface CommitUploadResponse {
  status: 'SUCCESS' | 'FAILURE'
  reason?: 'CHECKSUM_MISMATCH' | 'SIZE_MISMATCH' | 'FILE_NOT_FOUND' | 'SERVER_ERROR'
}

export interface UploadLock {
  userId: string
  context: string
  targetPath: string
  uuid: string
  token: string
  expectedSize: number
  expectedSha256: string
  lastActivity: number
}

export const activeUploads = new Map<string, UploadLock>()
export const STAGING_DIR = path.join(process.cwd(), 'files', '.staging')

export const LOCK_TIMEOUT_MS = 2 * 60 * 1000
const globalStore = globalThis as unknown as { __uploadGCStarted?: boolean }

fs.mkdir(STAGING_DIR, { recursive: true }).catch(console.error)

export function createLock(data: Omit<UploadLock, 'uuid' | 'token' | 'lastActivity'>) {
  const uuid = randomUUID()
  const token = randomBytes(32).toString('hex')

  activeUploads.set(data.targetPath, {
    ...data,
    uuid,
    token,
    lastActivity: Date.now()
  })

  return { uuid, token }
}

function startGarbageCollector() {
  setInterval(() => {
    const now = Date.now()
    for (const [targetPath, lock] of activeUploads.entries()) {
      if (now - lock.lastActivity > LOCK_TIMEOUT_MS) {
        activeUploads.delete(targetPath)
        const partPath = path.join(STAGING_DIR, `${lock.uuid}.part`)
        fs.unlink(partPath).catch(() => {})
      }
    }
  }, 60 * 1000)
}

if (!globalStore.__uploadGCStarted) { // used for dev HMR to avoid multiple GC instances
  startGarbageCollector()
  globalStore.__uploadGCStarted = true
}


