import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import path from 'node:path'
import { activeUploads, STAGING_DIR } from '$lib/server/uploader'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const uuid = request.headers.get('x-upload-uuid')
  const token = request.headers.get('x-upload-token')

  if (!uuid || !token) return json({ message: 'Missing credentials' }, { status: 400 })

  let currentLock
  for (const lock of activeUploads.values()) {
    if (lock.uuid === uuid) {
      currentLock = lock
      break
    }
  }

  if (!currentLock || currentLock.token !== token) {
    return json({ message: 'Forbidden or expired session' }, { status: 403 })
  }

  try {
    const partPath = path.join(STAGING_DIR, `${uuid}.part`)
    const chunkBuffer = Buffer.from(await request.arrayBuffer())

    await fs.appendFile(partPath, chunkBuffer)

    currentLock.lastActivity = Date.now()

    return new Response(null, { status: 200 })
  } catch (err) {
    console.error("Error writing chunk:", err)
    return json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

