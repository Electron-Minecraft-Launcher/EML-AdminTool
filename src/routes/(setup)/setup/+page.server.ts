import { error, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { setupSchema } from '$lib/utils/validations'
import { initDatabase, changeDatabasePassword, setAdminUser, setLanguage, setPin, markAsConfigured, restartServer, restartUpdater, setDefaultInstance } from '$lib/server/setup'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad

export const actions: Actions = {
  setup: async (event) => {
    if (event.locals.isConfigured) {
      return fail(event, 400, { failure: 'Already configured' })
    }

    const form = await event.request.formData()

    const raw = {
      language: form.get('language'),
      dbPassword: form.get('db-password'),
      adminUsername: form.get('admin-username'),
      adminPassword: form.get('admin-password')
    }

    const result = setupSchema.safeParse(raw)

    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { language, dbPassword, adminUsername, adminPassword } = result.data

    try {
      await changeDatabasePassword(dbPassword)
      await initDatabase()
      await setAdminUser(adminUsername, adminPassword)
      await setDefaultInstance(adminUsername)
      await setPin()
      await setLanguage(language)
    } catch (err) {
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  finish: async (event) => {
    if (event.locals.isConfigured) {
      throw error(400, { message: 'Already configured' })
    }

    try {
      await markAsConfigured()
      await restartUpdater()
      
      restartServer()
    } catch (err) {
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}

