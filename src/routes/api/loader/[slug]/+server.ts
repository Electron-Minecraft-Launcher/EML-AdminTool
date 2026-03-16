import { defaultLoader, getLoader } from '$lib/server/loader'
import { getProfileBySlug } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
  const { slug } = event.params

  let profile
  try {
    profile = await getProfileBySlug(slug)
  } catch (err) {
    return json({ success: false, message: 'Failed to get loader' }, { status: 500 })
  }

  if (!profile) {
    return json({ success: false, message: 'Profile not found' }, { status: 404 })
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

  const res = {
    success: true,
    type: loader.type,
    minecraftVersion: loader.minecraftVersion,
    loaderVersion: loader.loaderVersion,
    format: loader.format,
    file: loader.file,
    updatedAt: loader.updatedAt
  }

  return json(res)
}

