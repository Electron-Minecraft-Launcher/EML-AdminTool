import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { File as File_ } from '$lib/utils/types'
import { finalizeBootstrapsSchema } from '$lib/utils/validations'
import { getBootstraps, updateBootstraps } from '$lib/server/bootstraps'
import semver from 'semver'
import { deleteFile, getFiles, uploadFile } from '$lib/server/files'

export const load = (async (event) => {
  const user = event.locals.user
  const domain = event.url.origin

  if (!user?.p_bootstraps) {
    throw redirect(303, '/dashboard')
  }

  try {
    let bootstraps = await db.bootstrap.findUnique({ where: { id: '1' } })

    const allFiles = await getFiles(domain, 'bootstraps')

    const winFiles = allFiles.filter((f) => f.path.includes('win') && f.type !== 'FOLDER')
    const macFiles = allFiles.filter((f) => f.path.includes('mac') && f.type !== 'FOLDER')
    const linFiles = allFiles.filter((f) => f.path.includes('lin') && f.type !== 'FOLDER')

    return {
      bootstraps: {
        ...bootstraps,
        winFiles,
        macFiles,
        linFiles
      }
    }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  finalizeBootstraps: async (event) => {
    const user = event.locals.user

    if (!user?.p_bootstraps) {
      return fail(event, 403, { failure: NotificationCode.UNAUTHORIZED })
    }

    const form = await event.request.formData()

    const raw = {
      version: form.get('version'),
      metadata: form.get('metadata')
    }

    const result = finalizeBootstrapsSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { version, metadata } = result.data
    const dbPayload: { win?: string; mac?: string; lin?: string } = {}

    const cleanOldFiles = async (platform: string, keepFiles: string[]) => {
      try {
        const allFiles = await getFiles('', 'bootstraps')
        
        const platformFiles = allFiles.filter((f) => f.path === `${platform}/` && f.type !== 'FOLDER')

        for (const file of platformFiles) {
          if (!keepFiles.includes(file.name)) {
            await deleteFile('bootstraps', `${platform}/${file.name}`)
          }
        }
      } catch (err) {
        console.warn(`Failed to clean old files in ${platform}:`, err)
      }
    }

    if (metadata.win) {
      await cleanOldFiles('win', metadata.win.keepFiles)
      dbPayload.win = metadata.win.mainFileName
    }
    if (metadata.mac) {
      await cleanOldFiles('mac', metadata.mac.keepFiles)
      dbPayload.mac = metadata.mac.mainFileName
    }
    if (metadata.lin) {
      await cleanOldFiles('lin', metadata.lin.keepFiles)
      dbPayload.lin = metadata.lin.mainFileName
    }

    try {
      const current = await getBootstraps()
      await updateBootstraps(version, current, dbPayload)
      return { success: true }
    } catch (err) {
      console.error('Failed to update bootstrap DB:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteBootstrap: async (event) => {
    const user = event.locals.user

    if (!user?.p_bootstraps) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const platform = form.get('platform')

    if (typeof platform !== 'string' || !['win', 'mac', 'lin'].includes(platform)) {
      return fail(event, 400, { failure: NotificationCode.INVALID_REQUEST })
    }

    try {
      try {
        await deleteFile('bootstraps', platform)
      } catch (err) {
        console.error(`Failed to delete bootstrap folder for ${platform}:`, err)
      }

      try {
        await db.bootstrap.update({
          where: { id: '1' },
          data: { [`${platform}File`]: null }
        })
      } catch (err) {
        console.error('Failed to update bootstrap in DB:', err)
        throw new ServerError('Failed to update bootstrap DB', err, NotificationCode.DATABASE_ERROR, 500)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}


