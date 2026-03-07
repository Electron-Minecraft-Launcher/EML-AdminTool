import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { loginSchema } from '$lib/utils/validations'
import { login } from '$lib/server/auth'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { error, redirect } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import { NotificationCode } from '$lib/utils/notifications'
import { createSessionToken } from '$lib/server/jwt'
import { sleep } from '$lib/utils/utils'

export const load = (async (event) => {
  if (event.locals.user) {
    throw redirect(303, '/dashboard')
  }
  return {}
}) satisfies PageServerLoad

export const actions: Actions = {
  login: async (event) => {
    await sleep(1000) // Prevent brute-force attacks by adding a delay

    const form = await event.request.formData()

    const raw = {
      username: form.get('username'),
      password: form.get('password')
    }

    const result = loginSchema.safeParse(raw)

    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { username, password } = result.data

    try {
      const user = await login(username, password)
      const sessionToken = await createSessionToken(user)

      event.cookies.set('session', sessionToken, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), path: '/', secure: false })
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}
