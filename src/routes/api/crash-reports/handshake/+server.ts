import { createScopedToken } from '$lib/server/jwt'
import { NotificationCode } from '$lib/utils/notifications'
import { crashReportsLimiter } from '$lib/server/limiter'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
  const ip = event.getClientAddress()

  if (!crashReportsLimiter.canCreateHandshakeToken(ip)) {
    console.warn(`Too many handshake requests from IP ${ip}`)
    return json({ success: false, message: NotificationCode.TOO_MANY_REQUESTS }, { status: 429 })
  }

  try {
    const token = await createScopedToken('crashreports', '30m', { ip })
    crashReportsLimiter.registerHandshakeToken(ip)
    return json({ success: true, token })
  } catch (err) {
    console.error('Failed to create crash reports token:', err)
    return json({ success: false, message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}
