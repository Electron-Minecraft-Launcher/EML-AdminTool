import { getCachedFiles } from '$lib/server/files'
import { getDefaultProfile } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
  const domain = event.url.origin

  let profile
  try {
    profile = await getDefaultProfile()
  } catch (err) {
    return json({ success: false, message: 'Failed to get default profile' }, { status: 500 })
  }

  let cache
  try {
    cache = await getCachedFiles(domain, `files-updater/${profile?.slug}`)
  } catch (err) {
    return json({ success: false, message: 'Failed to get cached files' }, { status: 500 })
  }

  let parsedCache
  try {
    parsedCache = cache ? JSON.parse(cache) : []
  } catch (err) {
    console.error('Failed to parse cached files for profile:', profile?.slug, err)
    return json({ success: false, message: 'Failed to parse cached files' }, { status: 500 })
  }

  const res = {
    success: true,
    files: parsedCache
  }

  return json(res)
}


