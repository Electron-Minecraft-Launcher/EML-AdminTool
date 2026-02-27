import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { activeUploads, STAGING_DIR } from '$lib/server/uploader'
import { cacheFiles, getCachedFilesParsed } from '$lib/server/files'
import type { RequestHandler } from './$types'
import type { Context } from '$lib/utils/types'

async function getFileSha256(filePath: string) {
  const hash = crypto.createHash('sha256')
  const stream = createReadStream(filePath)

  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function abortAndCleanup(targetPathKey: string, partPath: string) {
  activeUploads.delete(targetPathKey)
  await fs.unlink(partPath).catch(() => {})
}

export const POST: RequestHandler = async ({ request, url }) => {
  const { uuid, token, context }: { uuid: string; token: string; context: Context } = await request.json()

  if (!uuid || !token || !context) {
    return json({ status: 'FAILURE', reason: 'BAD_REQUEST' }, { status: 400 })
  }

  let targetPathKey = ''
  let lock = null

  for (const [key, value] of activeUploads.entries()) {
    if (value.uuid === uuid) {
      targetPathKey = key
      lock = value
      break
    }
  }

  if (!lock || lock.token !== token) {
    return json({ status: 'FAILURE', reason: 'FORBIDDEN' }, { status: 403 })
  }

  const partPath = path.join(STAGING_DIR, `${uuid}.part`)

  try {
    const stats = await fs.stat(partPath)
    if (stats.size !== lock.expectedSize) {
      await abortAndCleanup(targetPathKey, partPath)
      return json({ status: 'FAILURE', reason: 'SIZE_MISMATCH' }, { status: 400 })
    }

    const actualSha256 = await getFileSha256(partPath)
    if (actualSha256 !== lock.expectedSha256) {
      await abortAndCleanup(targetPathKey, partPath)
      return json({ status: 'FAILURE', reason: 'CHECKSUM_MISMATCH' }, { status: 400 })
    }

    await fs.mkdir(path.dirname(lock.targetPath), { recursive: true })
    await fs.rename(partPath, lock.targetPath)

    activeUploads.delete(targetPathKey)
    await cacheFiles(context)

    const domain = url.origin
    const allFiles = await getCachedFilesParsed(domain, context as any)

    const relativePath = lock.targetPath.split(`files/${context}/`)[1]
    const dirPath = path.dirname(relativePath)
    const formattedDirPath = dirPath === '.' ? '' : `${dirPath}/`.replace(/\\/g, '/')
    const fileName = path.basename(relativePath)

    const newlyCreatedFile = allFiles.find((f) => f.name === fileName && f.path === formattedDirPath)

    return json({ status: 'SUCCESS', file: newlyCreatedFile })
  } catch (err) {
    console.error('Error during commit:', err)
    await abortAndCleanup(targetPathKey, partPath)
    return json({ status: 'FAILURE', reason: 'SERVER_ERROR' }, { status: 500 })
  }
}


