import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getActiveBackground } from '$lib/server/backgrounds'

export const GET: RequestHandler = async () => {
  let background

  try {
    background = await getActiveBackground()
  } catch (err) {
    return json({ success: false, message: 'Failed to get background' }, { status: 500 })
  }

  let res

  if (!background) {
    res = {
      success: true,
      background: null
    }
  } else {
    res = {
      success: true,
      name: background.name,
      status: background.status,
      createdAt: background.createdAt,
      updatedAt: background.updatedAt,
      file: background.file
    }
  }

  return json(res)
}

