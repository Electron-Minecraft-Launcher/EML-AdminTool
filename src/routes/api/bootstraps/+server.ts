import { getBootstraps } from '$lib/server/bootstraps'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  let bootstraps

  try {
    bootstraps = await getBootstraps()
  } catch (err) {
    return json({ success: false, message: 'Failed to get bootstraps' }, { status: 500 })
  }

  const res = {
    success: true,
    version: bootstraps?.version ?? '',
    winFile: bootstraps?.winFile ?? null,
    macFile: bootstraps?.macFile ?? null,
    linFile: bootstraps?.linFile ?? null
  }

  return json(res)
}

