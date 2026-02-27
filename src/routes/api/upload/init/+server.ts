import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import path from 'node:path'
import { sanitizePath } from '$lib/server/files'
import { activeUploads, createLock, LOCK_TIMEOUT_MS, STAGING_DIR } from '$lib/server/uploader'
import type { RequestHandler } from './$types'
import { NotificationCode } from '$lib/utils/notifications'
import type { Context } from '$lib/utils/types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user
  if (!user) return json({ message: NotificationCode.UNAUTHORIZED }, { status: 401 })

  const body = await request.json()
  const { context, files }: { context: Context, files: any[] } = body

  if (context === 'files-updater' && !user.p_filesUpdater) {
    return json({ message: NotificationCode.FORBIDDEN }, { status: 403 })
  } else if (context === 'bootstraps' && !user.p_bootstraps) {
    return json({ message: NotificationCode.FORBIDDEN }, { status: 403 })
  } else if (context === 'backgrounds' && !user.p_backgrounds) {
    return json({ message: NotificationCode.FORBIDDEN }, { status: 403 })
  } else if (context === 'images' && !user.p_news) {
    return json({ message: NotificationCode.FORBIDDEN }, { status: 403 })
  }

  const results = []

  for (const file of files) {
    try {
      const targetPath = sanitizePath('files', context, file.path)

      const existingLock = activeUploads.get(targetPath)
      if (existingLock) {
        if (Date.now() - existingLock.lastActivity < LOCK_TIMEOUT_MS) {
          results.push({ id: file.id, status: 'REJECTED', reason: 'LOCKED_BY_OTHER_USER' })
          continue
        } else {
          activeUploads.delete(targetPath)
          const oldPartPath = path.join(STAGING_DIR, `${existingLock.uuid}.part`)
          await fs.unlink(oldPartPath).catch(() => {})
        }
      }

      if (!file.overwrite) {
        try {
          await fs.access(targetPath)
          results.push({ id: file.id, status: 'REJECTED', reason: 'FILE_ALREADY_EXISTS' })
          continue
        } catch {
          // File doesn't exist, we can proceed
        }
      }

      const { uuid, token } = createLock({
        userId: user.id,
        context,
        targetPath,
        expectedSize: file.size,
        expectedSha256: file.sha256
      })

      results.push({ id: file.id, status: 'ACCEPTED', uuid, token })
    } catch (err) {
      results.push({ id: file.id, status: 'REJECTED', reason: 'FORBIDDEN_PATH' })
    }
  }
  return json({ results })
}

