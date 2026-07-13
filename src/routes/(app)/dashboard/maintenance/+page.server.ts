import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { NotificationCode } from '$lib/utils/notifications'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { maintenanceSchema } from '$lib/utils/validations'
import { updateMaintenance } from '$lib/server/maintenance'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.p_maintenance) {
    throw redirect(303, '/dashboard')
  }

  try {
    let maintenance
    try {
      maintenance = await db.maintenance.findFirst()
    } catch (err) {
      console.error('Failed to load maintenance:', err)
      throw new ServerError('Failed to load maintenance', err, NotificationCode.DATABASE_ERROR, 500)
    }

    maintenance ??= {
      startTime: null,
      endTime: null,
      message: '',
      allowedPseudos: []
    }

    if (user.p_maintenance !== 2) {
      maintenance.allowedPseudos = []
    }
    return { maintenance }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  changeMaintenanceStatus: async (event) => {
    const user = event.locals.user

    if (!user?.p_maintenance) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const raw = {
      startTime: form.get('start-time'),
      endTime: form.get('end-time'),
      message: form.get('message'),
      allowedPseudos: form.getAll('allowed-pseudos')
    }

    const result = maintenanceSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { startTime, endTime, message, allowedPseudos } = result.data

    const maintenance = {
      startTime: startTime,
      endTime: endTime,
      message: message,
      allowedPseudos: allowedPseudos
    }

    try {
      const existingMaintenance = (await db.maintenance.findFirst()) ?? {
        startTime: null,
        endTime: null,
        message: '',
        allowedPseudos: []
      }
      if (user.p_maintenance !== 2) {
        maintenance.allowedPseudos = existingMaintenance.allowedPseudos
      }
      await updateMaintenance(maintenance)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}

