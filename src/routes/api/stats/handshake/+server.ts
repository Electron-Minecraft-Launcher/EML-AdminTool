import { createScopedToken } from '$lib/server/jwt'
import { NotificationCode } from '$lib/utils/notifications'
import { statsLimiter } from '$lib/server/limiter'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
  const ip = event.getClientAddress()

  if (!statsLimiter.canCreateHandshakeToken(ip)) {
    console.warn(`Too many handshake requests from IP ${ip}`)
    return json({ message: NotificationCode.TOO_MANY_REQUESTS }, { status: 429 })
  }

  try {
    const token = await createScopedToken('stats', '10m', { ip })
    statsLimiter.registerHandshakeToken(ip)
    return json({ token })
  } catch (err) {
    console.error('Failed to create stats token:', err)
    return json({ message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }
}
