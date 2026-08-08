import { defaultLoader, getLoader } from '$lib/server/loader'
import { getDefaultProfile } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getDomain } from '$lib/utils/utils'

export const GET: RequestHandler = async (event) => {
  const domain = getDomain(event)
  
  let profile
  try {
    profile = await getDefaultProfile()
  } catch (err) {
    return json({ success: false, message: 'Failed to get default profile' }, { status: 500 })
  }

  let loader
  try {
    loader = await getLoader(profile?.id)
  } catch (err) {
    return json({ success: false, message: 'Failed to get loader' }, { status: 500 })
  }

  if (!loader) {
    return json(defaultLoader)
  }

    if ((loader.file as { url: string })?.url) {
      (loader.file as { url: string }).url = (loader.file as { url: string }).url.replace('{{url}}', domain)
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


