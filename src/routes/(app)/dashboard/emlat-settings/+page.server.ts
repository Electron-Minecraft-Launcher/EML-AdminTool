import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { error, redirect, type Actions, type RequestEvent } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { getOS, getStorage } from '$lib/server/vps'
import { getUpdate, update } from '$lib/server/update'
import { editEMLATSchema, editUserSchema } from '$lib/utils/validations'
import { editEMLAT } from '$lib/server/emlat'
import { generateRandomPin, getPin } from '$lib/server/pin'
import type { LanguageCode } from '$lib/stores/language'
import { deleteUser, updateUser } from '$lib/server/user'
import { verify } from '$lib/server/auth'
import { deleteAllFiles, markAsUnconfigured, resetDatabase } from '$lib/server/reset'
import { restartServer } from '$lib/server/setup'
import { IUserStatus } from '$lib/utils/db'
import { dev } from '$app/environment'
import { getVanillaVersions } from '$lib/server/loaders/vanilla'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.isAdmin) {
    throw redirect(303, '/dashboard')
  }

  try {
    let environment, instances, users, vps, update, minecraftVersions

    try {
      environment = (await db.environment.findFirst())!
    } catch (err) {
      console.error('Failed to load environment:', err)
      throw new ServerError('Failed to load environment', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      instances = await db.instance.findMany({ orderBy: { name: 'asc' } })
    } catch (err) {
      console.error('Failed to load instances:', err)
      throw new ServerError('Failed to load instances', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      users = await db.user.findMany({ omit: { password: true }, orderBy: { username: 'asc' } })
    } catch (err) {
      console.error('Failed to load users:', err)
      throw new ServerError('Failed to load users', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      vps = { os: getOS(), storage: getStorage() }
    } catch (err) {
      console.error('Failed to get VPS information:', err)
      throw new ServerError('Failed to load VPS information', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
    }

    try {
      update = await getUpdate()
    } catch (err) {
      throw new ServerError('Failed to load update information', err, NotificationCode.EXTERNAL_API_ERROR, 500)
    }

    minecraftVersions = await getVanillaVersions()

    return { environment, instances, users, vps, update, minecraftVersions }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  editEMLAT: async (event) => {
    const user = event.locals.user
    const session = event.cookies.get('session') ?? ''

    if (!user?.isAdmin) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const user_ = await verify(session) // Oversecurity measure to ensure the user is still valid
    if (!user_?.isAdmin) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      name: form.get('name'),
      language: form.get('language'),
      regeneratePin: form.get('regenerate-pin') === 'on'
    }

    const result = editEMLATSchema.safeParse(raw)

    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { name, language, regeneratePin } = result.data

    try {
      const newPin = regeneratePin ? generateRandomPin() : await getPin()
      await editEMLAT(name, language as LanguageCode, newPin)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  editUser: async (event) => {
    const user = event.locals.user

    if (!user?.isAdmin) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()

    const raw = {
      userId: form.get('user-id'),
      username: form.get('username'),
      p_filesUpdater_1: form.get('p_files-updater_1') === 'on',
      p_filesUpdater_2: form.get('p_files-updater_2') === 'on',
      p_bootstraps: form.get('p_bootstraps') === 'on',
      p_maintenance: form.get('p_maintenance') === 'on',
      p_news_1: form.get('p_news_1') === 'on',
      p_news_2: form.get('p_news_2') === 'on',
      p_newsCategories: form.get('p_news-categories') === 'on',
      p_newsTags: form.get('p_news-tags') === 'on',
      p_backgrounds: form.get('p_backgrounds') === 'on',
      p_stats_1: form.get('p_stats_1') === 'on',
      p_stats_2: form.get('p_stats_2') === 'on'
    }

    const result = editUserSchema.safeParse(raw)

    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const userId = result.data.userId
    const username = result.data.username
    const status = IUserStatus.ACTIVE
    const p_filesUpdater = getFilesUpdaterPermission(result)
    const p_bootstraps = result.data.p_bootstraps ? 1 : 0
    const p_maintenance = result.data.p_maintenance ? 1 : 0
    const p_news = getNewsPermissions(result)
    const p_newsCategories = result.data.p_newsCategories ? 1 : 0
    const p_newsTags = result.data.p_newsTags ? 1 : 0
    const p_backgrounds = result.data.p_backgrounds ? 1 : 0
    const p_stats = getStatsPermissions(result)

    try {
      await updateUser(userId, {
        username,
        status,
        p_filesUpdater,
        p_bootstraps,
        p_maintenance,
        p_news,
        p_newsCategories,
        p_newsTags,
        p_backgrounds,
        p_stats
      })
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  refuseUser: refuseDeleteUser,

  deleteUser: refuseDeleteUser,

  deleteUserForever: async (event) => {
    const user = event.locals.user

    if (!user?.isAdmin) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()

    const userId = form.get('user-id')

    if (!userId) {
      return { failure: NotificationCode.MISSING_INPUT }
    }

    if (typeof userId !== 'string') {
      return { failure: NotificationCode.INVALID_INPUT }
    }

    try {
      await deleteUser(userId)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  updateEMLAT: async (event) => {
    const user = event.locals.user

    if (!user?.isAdmin) {
      return error(403, { message: NotificationCode.FORBIDDEN })
    }

    try {
      await update()

      if (dev) {
        return { dev: true }
      } else {
        return { dev: false }
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  resetEMLAT: async (event) => {
    const user = event.locals.user

    if (!user?.isAdmin) {
      return error(403, { message: NotificationCode.FORBIDDEN })
    }

    try {
      await markAsUnconfigured()
      await resetDatabase()
      await deleteAllFiles()

      restartServer()
    } catch (err) {
      if (err instanceof BusinessError) throw fail(event, 400, { failure: err.message })
      if (err instanceof ServerError) throw error(500, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}

async function refuseDeleteUser(event: RequestEvent<any>) {
  const user = event.locals.user

  if (!user?.isAdmin) {
    throw error(403, { message: NotificationCode.FORBIDDEN })
  }

  const form = await event.request.formData()

  const userId = form.get('user-id')

  if (!userId) {
    return { failure: NotificationCode.MISSING_INPUT }
  }

  if (typeof userId !== 'string') {
    return { failure: NotificationCode.INVALID_INPUT }
  }

  try {
    await updateUser(userId, {
      status: IUserStatus.DELETED,
      p_filesUpdater: 0,
      p_bootstraps: 0,
      p_maintenance: 0,
      p_news: 0,
      p_newsCategories: 0,
      p_newsTags: 0,
      p_backgrounds: 0,
      p_stats: 0
    })
  } catch (err) {
    if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}

function getFilesUpdaterPermission(result: any) {
  if (result.data.p_filesUpdater_2) return 2
  if (result.data.p_filesUpdater_1) return 1
  return 0
}

function getNewsPermissions(result: any) {
  if (result.data.p_news_2) return 2
  if (result.data.p_news_1 || result.data.p_newsCategories || result.data.p_newsTags) return 1
  return 0
}

function getStatsPermissions(result: any) {
  if (result.data.p_stats_2) return 2
  if (result.data.p_stats_1) return 1
  return 0
}

