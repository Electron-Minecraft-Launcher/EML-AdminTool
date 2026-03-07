import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async (event) => {
  const user = event.locals.user
  if (!user?.p_stats) {
    throw redirect(303, '/dashboard')
  }
}) satisfies PageServerLoad
