import { getBearerToken, verifyScopedToken } from '$lib/server/jwt'
import { NotificationCode } from '$lib/utils/notifications'
import { extStatSchemas } from '$lib/utils/validations'
import { json, type RequestHandler } from '@sveltejs/kit'
import { statsLimiter } from '$lib/server/limiter'
import { ZodError } from 'zod/v4'
import { addStat } from '$lib/server/stats'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { readLimitedText } from '$lib/server/request'

const MAX_STATS_BODY_SIZE = 4 * 1024

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress()
  const ev = (event.params.event ?? '') as keyof typeof extStatSchemas
  const tk = getBearerToken(event.request) ?? ''

  if (!(ev in extStatSchemas)) {
    console.warn(`Invalid stat event: ${ev} from IP ${ip}`)
    return json({ success: false, message: NotificationCode.NOT_FOUND }, { status: 404 })
  }

  if (!(await verifyScopedToken(tk, 'stats', { ip }))) {
    console.warn(`Unauthorized stat submission attempt from IP ${ip}`)
    return json({ success: false, message: NotificationCode.UNAUTHORIZED }, { status: 401 })
  }

  if (!statsLimiter.canPerformAction(ip)) {
    console.warn(`Too many stat submissions from IP ${ip}`)
    return json({ success: false, message: NotificationCode.TOO_MANY_REQUESTS }, { status: 429 })
  }

  let body
  try {
    const text = await readLimitedText(event.request, MAX_STATS_BODY_SIZE)
    body = text.trim() ? JSON.parse(text) : {}
  } catch (err) {
    if (err instanceof BusinessError) {
      return json({ success: false, message: err.code }, { status: err.httpStatus })
    }
    console.warn(`Invalid JSON body from IP ${ip}:`, err)
    return json({ success: false, message: NotificationCode.INVALID_INPUT }, { status: 400 })
  }

  let payload
  try {
    payload = extStatSchemas[ev].parse(body ?? {})
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn(`Invalid request body for event ${ev} from IP ${ip}:`, err.issues)
      return json({ success: false, message: NotificationCode.INVALID_INPUT, issues: err.issues }, { status: 400 })
    }
    console.error(`Unexpected error validating request body for event ${ev} from IP ${ip}:`, err)
    return json({ success: false, message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }

  try {
    await addStat(ev, payload)
  } catch (err) {
    if (err instanceof BusinessError) {
      return json({ success: false, message: err.code }, { status: err.httpStatus })
    }
    if (err instanceof ServerError) {
      return json({ success: false, message: err.code }, { status: err.httpStatus })
    }

    console.error('Failed to record stat:', err)
    return json({ success: false, message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }

  return json({ success: true })
}
