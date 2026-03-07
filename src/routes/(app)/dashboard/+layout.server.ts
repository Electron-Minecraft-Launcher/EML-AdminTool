import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
  if (!event.locals.user) {
    throw redirect(303, '/login')
  }

  return { user: event.locals.user }
}) satisfies LayoutServerLoad
