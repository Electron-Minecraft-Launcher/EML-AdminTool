import { defaultLoader, getLoader } from '$lib/server/loader'
import { getProfileBySlug } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { ProfileVisibility } from '@prisma/client'
import { getBearerToken, verifyScopedToken } from '$lib/server/jwt'
import { getDomain } from '$lib/utils/utils'

export const GET: RequestHandler = async (event) => {
  const slug = event.params.slug
  const token = getBearerToken(event.request)
  const domain = getDomain(event)

  let profile
  try {
    profile = await getProfileBySlug(slug)
  } catch (err) {
    return json({ success: false, message: 'Failed to get loader' }, { status: 500 })
  }

  if (!profile) {
    return json({ success: false, message: 'Profile not found' }, { status: 404 })
  }

  if (profile.visibility === ProfileVisibility.PROTECTED) {
    if (!token) {
      return json({ success: false, message: 'Missing Authorization header' }, { status: 401 })
    }
    const isValid = await verifyScopedToken(token, `profile`, { slug })
    if (!isValid) {
      return json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }
  }

  let loader
  try {
    loader = await getLoader(profile.id)
  } catch (err) {
    return json({ success: false, message: 'Failed to get loader' }, { status: 500 })
  }

  if (!loader) {
    return json(defaultLoader)
  }

  if ((loader.file as { url: string })?.url) {
    ;(loader.file as { url: string }).url = (loader.file as { url: string }).url.replace('{{url}}', domain)
  }

  const res = {
    success: true,
    type: loader.type,
    minecraftVersion: loader.minecraftVersion,
    loaderVersion: loader.loaderVersion,
    customVersion: loader.customVersion,
    file: loader.file,
    updatedAt: loader.updatedAt
  }

  return json(res)
}

