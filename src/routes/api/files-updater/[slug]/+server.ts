import { getCachedFiles } from '$lib/server/files'
import { getProfileBySlug } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
  const domain = event.url.origin
  const { slug } = event.params

  let profile
  try {
    profile = await getProfileBySlug(slug)
  } catch (err) {
    return json({ success: false, message: 'Failed to get profile' }, { status: 500 })
  }

  if (!profile) {
    return json({ success: false, message: 'Profile not found' }, { status: 404 })
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

