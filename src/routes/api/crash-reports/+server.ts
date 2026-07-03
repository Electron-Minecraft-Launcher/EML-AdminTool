import { getBearerToken, verifyScopedToken } from '$lib/server/jwt'
import { NotificationCode } from '$lib/utils/notifications'
import { crashReportSchema } from '$lib/utils/validations'
import { json, type RequestHandler } from '@sveltejs/kit'
import { crashReportsLimiter } from '$lib/server/limiter'
import { ZodError } from 'zod/v4'
import { addCrashReport } from '$lib/server/crashreports'
import { BusinessError, ServerError } from '$lib/utils/errors'

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress()
  const tk = getBearerToken(event.request) ?? ''

  if (!(await verifyScopedToken(tk, 'crashreports'))) {
    console.warn(`Unauthorized crash report submission attempt from IP ${ip}`)
    return json({ message: NotificationCode.UNAUTHORIZED }, { status: 401 })
  }

  if (!crashReportsLimiter.canPerformAction(ip)) {
    console.warn(`Too many crash report submissions from IP ${ip}`)
    return json({ message: NotificationCode.TOO_MANY_REQUESTS }, { status: 429 })
  }

  let body
  try {
    const text = await event.request.text()
    body = text.trim() ? JSON.parse(text) : {}
  } catch (err) {
    console.warn(`Invalid JSON body from IP ${ip}:`, err)
    return json({ message: NotificationCode.INVALID_INPUT }, { status: 400 })
  }

  let payload
  try {
    payload = crashReportSchema.parse(body ?? {})
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn(`Invalid request body from IP ${ip}:`, err.issues)
      return json({ message: NotificationCode.INVALID_INPUT, issues: err.issues }, { status: 400 })
    }
    console.error(`Unexpected error validating request body from IP ${ip}:`, err)
    return json({ message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }

  try {
    await addCrashReport(payload.metadata, payload.logData)
  } catch (err) {
    if (err instanceof BusinessError) {
      return json({ message: err.code }, { status: err.httpStatus })
    }
    if (err instanceof ServerError) {
      return json({ message: err.code }, { status: err.httpStatus })
    }

    console.error('Failed to record crash report:', err)
    return json({ message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
