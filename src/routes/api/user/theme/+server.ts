import { json, type RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { THEME_COOKIE, isThemePreference, themeCookieOptions } from '$lib/utils/theme'

export const PUT: RequestHandler = async ({ request, locals, cookies, url }) => {
  if (!locals.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    console.warn('Invalid theme preference request body:', err)
    return json({ success: false, message: 'Invalid theme preference' }, { status: 400 })
  }

  const theme = body && typeof body === 'object' && 'theme' in body ? body.theme : undefined
  if (!isThemePreference(theme)) {
    return json({ success: false, message: 'Invalid theme preference' }, { status: 400 })
  }

  try {
    await db.user.update({
      where: { id: locals.user.id },
      data: { theme }
    })

    cookies.set(THEME_COOKIE, theme, themeCookieOptions(url))

    return json({ success: true, theme })
  } catch (err) {
    console.error('Failed to save theme preference:', err)
    return json({ success: false, message: 'Failed to save theme preference' }, { status: 500 })
  }
}
