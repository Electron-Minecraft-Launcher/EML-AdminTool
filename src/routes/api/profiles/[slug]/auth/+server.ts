import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getBasicAuthCredentials, createScopedToken } from '$lib/server/jwt'
import { getProfileBySlug } from '$lib/server/profile'
import bcrypt from 'bcrypt'
import { ProfileVisibility } from '@prisma/client'
import { profileLimiter } from '$lib/server/limiter'
import { NotificationCode } from '$lib/utils/notifications'

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress()
  const slug = event.params.slug
  const credentials = getBasicAuthCredentials(event.request)

  if (!profileLimiter.canPerformAction(`${ip}:${slug}`)) {
    console.warn(`Too many stat submissions from IP ${ip} for profile ${slug}`)
    return json({ success: false, message: NotificationCode.TOO_MANY_REQUESTS }, { status: 429 })
  }

  if (!credentials) {
    return json({ success: false, message: 'Missing Authorization header' }, { status: 401 })
  }

  if (credentials.username !== slug) {
    return json({ success: false, message: 'Slug mismatch' }, { status: 403 })
  }

  let profile
  try {
    profile = await getProfileBySlug(slug)
  } catch (err) {
    return json({ success: false, message: 'Database error' }, { status: 500 })
  }

  if (!profile) {
    return json({ success: false, message: 'Profile not found' }, { status: 404 })
  }

  if (profile.visibility !== ProfileVisibility.PROTECTED || !profile.password) {
    return json({ success: false, message: 'Profile is not protected' }, { status: 400 })
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, profile.password)

  if (!isPasswordValid) {
    return json({ success: false, message: 'Invalid password' }, { status: 401 })
  }

  const token = await createScopedToken('profile', '2h', { slug })

  return json({
    success: true,
    token
  })
}
