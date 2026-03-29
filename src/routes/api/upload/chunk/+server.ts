import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import path from 'node:path'
import { activeUploads, STAGING_DIR, uploadsByUuid } from '$lib/server/uploader'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user
  if (!user) {
    return json({ message: 'Unauthorized' }, { status: 401 })
  }

  const uuid = request.headers.get('x-upload-uuid')
  const token = request.headers.get('x-upload-token')

  if (!uuid || !token) {
    return json({ message: 'Missing credentials' }, { status: 400 })
  }

  const targetPath = uploadsByUuid.get(uuid)
  const currentLock = targetPath ? activeUploads.get(targetPath) : null

  if (!currentLock || currentLock.token !== token || currentLock.userId !== user.id) {
    return json({ message: 'Forbidden or expired session' }, { status: 403 })
  }

  try {
    const partPath = path.join(STAGING_DIR, `${uuid}.part`)
    const chunkBuffer = Buffer.from(await request.arrayBuffer())
    const stats = await fs.stat(partPath).catch(() => ({ size: 0 }))

    if (stats.size + chunkBuffer.length > currentLock.expectedSize) {
      await fs.unlink(partPath).catch(() => {})
      if (targetPath) activeUploads.delete(targetPath)
      uploadsByUuid.delete(uuid)
      return json({ message: 'Size exceeded' }, { status: 413 })
    }

    await fs.appendFile(partPath, chunkBuffer)

    currentLock.lastActivity = Date.now()

    return new Response(null, { status: 200 })
  } catch (err) {
    console.error('Error writing chunk:', err)
    return json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

