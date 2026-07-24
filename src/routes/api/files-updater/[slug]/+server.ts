import { getCachedFiles } from '$lib/server/files'
import { getProfileBySlug } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getDomain } from '$lib/utils/utils'
import { getBearerToken } from '$lib/server/request'
import { ProfileVisibility } from '@prisma/client'
import { verifyScopedToken } from '$lib/server/jwt'

export const GET: RequestHandler = async (event) => {
  const domain = getDomain(event)
  const slug = event.params.slug
  const token = getBearerToken(event.request)

  let profile
  try {
    profile = await getProfileBySlug(slug)
  } catch (err) {
    return json({ success: false, message: 'Failed to get profile' }, { status: 500 })
  }

  if (!profile) {
    return json({ success: false, message: 'Profile not found' }, { status: 404 })
  }

  if (profile.visibility === ProfileVisibility.PROTECTED) {
    if (!token) {
      return json({ success: false, message: 'Missing Authorization header' }, { status: 401 })
    }
    console.log(token, profile.slug)
    const isValid = await verifyScopedToken(token, `profile`, { slug })
    if (!isValid) {
      return json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }
  }

  let cache
  try {
    cache = await getCachedFiles(domain, `files-updater/${slug}`)
  } catch (err) {
    return json({ success: false, message: 'Failed to get cached files' }, { status: 500 })
  }

  let parsedCache
  try {
    parsedCache = cache ? JSON.parse(cache) : []
  } catch (err) {
    console.error('Failed to parse cached files for profile:', slug, err)
    return json({ success: false, message: 'Failed to parse cached files' }, { status: 500 })
  }

  const res = {
    success: true,
    files: parsedCache
  }

  return json(res)
}
