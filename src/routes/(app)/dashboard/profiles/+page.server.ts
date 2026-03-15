import { error, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { getVanillaVersions } from '$lib/server/loaders/vanilla'
import { verify } from '$lib/server/auth'
import { profileSchema } from '$lib/utils/validations'
import { fail } from '$lib/server/action'
import { addProfile, getProfileById, updateProfile } from '$lib/server/profile'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.isAdmin) {
    throw redirect(303, '/dashboard')
  }

  try {
    let profiles, minecraftVersions

    try {
      profiles = await db.profile.findMany({ orderBy: { name: 'asc' } })
    } catch (err) {
      console.error('Failed to load profiles:', err)
      throw new ServerError('Failed to load profiles', err, NotificationCode.DATABASE_ERROR, 500)
    }

    minecraftVersions = await getVanillaVersions()

    return { profiles, minecraftVersions }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  addEditProfile: async (event) => {
    const user = event.locals.user
    const session = event.cookies.get('session') ?? ''

    if (!user?.isAdmin) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const user_ = await verify(session) // oversecurity measure to ensure the user is still valid
    if (!user_?.isAdmin) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      name: form.get('name'),
      ip: form.get('ip') || undefined,
      port: form.get('port') ? Number(form.get('port')) : undefined,
      tcpProtocol: form.get('tcp-protocol') || undefined
    }

    const result = profileSchema.safeParse(raw)

    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, name, ip, port, tcpProtocol } = result.data

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')

    try {
      if (profileId) {
        const profile = await getProfileById(profileId)
        if (!profile) {
          console.warn(`Profile with ID ${profileId} not found`)
          throw new BusinessError('Profile not found', NotificationCode.NOT_FOUND, 404)
        }

        await updateProfile(profileId, name, slug, ip, port, tcpProtocol)
      } else {
        await addProfile(name, slug, ip, port, tcpProtocol)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}
