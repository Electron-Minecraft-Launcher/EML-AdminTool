import { getNewsCategories } from '$lib/server/news'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  let newsCategories

  try {
    newsCategories = await getNewsCategories()
  } catch (err) {
    return json({ success: false, message: 'Failed to get news categories' }, { status: 500 })
  }

  const res = {
    success: true,
    newsCategories
  }

  return json(res)
}
