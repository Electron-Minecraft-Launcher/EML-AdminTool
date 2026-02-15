import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { File as File_ } from '$lib/utils/types'
import { bootstrapsSchema } from '$lib/utils/validations'
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
    let bootstraps
    try {
      bootstraps = await db.bootstrap.findUnique({ where: { id: '1' } })
    } catch (err) {
      console.error('Failed to load bootstraps:', err)
      throw new ServerError('Failed to load bootstraps', err, NotificationCode.DATABASE_ERROR, 500)
    }

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
  changeBootstraps: async (event) => {
    const user = event.locals.user

    if (!user?.p_bootstraps) {
      return { error: NotificationCode.UNAUTHORIZED }
    }

    const form = await event.request.formData()
    const raw = {
      winFiles: form.getAll('win-files'),
      macFiles: form.getAll('mac-files'),
      linFiles: form.getAll('lin-files')
    }

    const result = bootstrapsSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { winFiles, macFiles, linFiles } = result.data

    if (winFiles.length === 0 && macFiles.length === 0 && linFiles.length === 0) {
      return
    }

    const processPlatform = async (files: File[], platform: 'win' | 'mac' | 'lin', yamlName: string) => {
      if (files.length === 0) return null

      const yamlFile = files.find((f) => f.name === yamlName)
      if (!yamlFile) {
        throw new BusinessError(`Missing ${yamlName}`, NotificationCode.INVALID_INPUT, 400)
      }

      const content = await yamlFile.text()
      const version = extractVersionFromYaml(content)

      if (!version || !semver.valid(version)) {
        throw new BusinessError('Invalid version in YAML', NotificationCode.BOOTSTRAPS_MALFORMED_VERSION, 400)
      }

      try {
        await deleteFile('bootstraps', platform)
      } catch (err) {
        console.warn(`Failed to clean ${platform} folder (might be empty):`, err)
      }

      let mainFileName: string | undefined

      for (const file of files) {
        await uploadFile('bootstraps', platform, file)

        if (file.name.endsWith('.exe') || file.name.endsWith('.dmg') || file.name.endsWith('.AppImage')) {
          mainFileName = file.name
        }
      }

      return { version, mainFileName: mainFileName ?? files[0].name }
    }

    try {
      const [winRes, macRes, linRes] = await Promise.all([
        processPlatform(winFiles, 'win', 'latest.yml'),
        processPlatform(macFiles, 'mac', 'latest-mac.yml'),
        processPlatform(linFiles, 'lin', 'latest-linux.yml')
      ])

      const current = await getBootstraps()
      let displayVersion = current?.version ?? '0.0.0'

      if (winRes && semver.gt(winRes.version, displayVersion)) displayVersion = winRes.version
      if (macRes && semver.gt(macRes.version, displayVersion)) displayVersion = macRes.version
      if (linRes && semver.gt(linRes.version, displayVersion)) displayVersion = linRes.version

      await updateBootstraps(displayVersion, current, {
        win: winRes?.mainFileName,
        mac: macRes?.mainFileName,
        lin: linRes?.mainFileName
      })
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
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

function extractVersionFromYaml(content: string): string | null {
  const match = content.match(/^version:\s*(.+)$/m)
  return match ? match[1].trim() : null
}
