import { error, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { getVanillaVersions } from '$lib/server/loaders/vanilla'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.isAdmin) {
    throw redirect(303, '/dashboard')
  }

  try {
    let profils, minecraftVersions

    try {
      profils = await db.profil.findMany({ orderBy: { name: 'asc' } })
    } catch (err) {
      console.error('Failed to load profils:', err)
      throw new ServerError('Failed to load profils', err, NotificationCode.DATABASE_ERROR, 500)
    }

    minecraftVersions = await getVanillaVersions()

    return { profils, minecraftVersions }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  addEditProfil: async (event) => {}
}
