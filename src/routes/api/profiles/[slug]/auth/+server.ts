import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getBasicAuthCredentials, createScopedToken } from '$lib/server/jwt'
import { getProfileBySlug } from '$lib/server/profile'
import bcrypt from 'bcrypt'

export const POST: RequestHandler = async ({ request, params }) => {
  const credentials = getBasicAuthCredentials(request)

  if (!credentials) {
    return json({ success: false, message: 'Missing Authorization header' }, { status: 401 })
  }

  if (credentials.username !== params.slug) {
    return json({ success: false, message: 'Slug mismatch' }, { status: 403 })
  }

  let profile
  try {
    profile = await getProfileBySlug(params.slug)
  } catch (err) {
    return json({ success: false, message: 'Database error' }, { status: 500 })
  }

  if (!profile) {
    return json({ success: false, message: 'Profile not found' }, { status: 404 })
  }

  if (profile.visibility !== 'PROTECTED' || !profile.password) {
    return json({ success: false, message: 'Profile is not protected' }, { status: 400 })
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, profile.password)

  if (!isPasswordValid) {
    return json({ success: false, message: 'Invalid password' }, { status: 401 })
  }

  const token = await createScopedToken('profile', '1h', { profileId: profile.id })

  return json({
    success: true,
    token
  })
}
