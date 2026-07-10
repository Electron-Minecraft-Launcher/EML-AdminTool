import { getBearerToken, verifyScopedToken } from '$lib/server/jwt'
import { NotificationCode } from '$lib/utils/notifications'
import { extCrashReportSchema, uuidSchema } from '$lib/utils/validations'
import { json, type RequestHandler } from '@sveltejs/kit'
import { crashReportsLimiter } from '$lib/server/limiter'
import { ZodError } from 'zod/v4'
import { addCrashReport, getCrashReportByFileId } from '$lib/server/crashreports'
import { BusinessError, ServerError } from '$lib/utils/errors'
import fs from 'fs/promises'
import { readLimitedText } from '$lib/server/request'
import { sanitizePath } from '$lib/server/files'

const MAX_CRASH_REPORT_BODY_SIZE = 5 * 1024 * 1024

export const GET: RequestHandler = async ({ request, locals }) => {
  const user = locals.user
  const fileId = request.headers.get('file-id')

  if (!user) {
    console.warn('Unauthorized crash report retrieval attempt')
    return json({ message: NotificationCode.UNAUTHORIZED }, { status: 401 })
  }

  if (!user.p_crashReports) {
    console.warn('Forbidden crash report retrieval attempt: insufficient permissions')
    return json({ message: NotificationCode.FORBIDDEN }, { status: 403 })
  }

  if (!fileId) {
    console.warn('Bad request: missing file-id header')
    return json({ message: NotificationCode.INVALID_INPUT }, { status: 400 })
  }

  const fileIdResult = uuidSchema.safeParse(fileId)
  if (!fileIdResult.success) {
    console.warn('Bad request: invalid file-id header')
    return json({ message: NotificationCode.INVALID_INPUT }, { status: 400 })
  }

  let file
  try {
    const report = await getCrashReportByFileId(fileIdResult.data)
    if (!report) {
      return json({ message: NotificationCode.NOT_FOUND }, { status: 404 })
    }

    const filePath = sanitizePath('data', 'crash-reports', `crash_${report.fileId}.log`)
    file = await fs.readFile(filePath, 'utf-8')
  } catch (err) {
    console.warn(`File not found for ID ${fileId}:`, err)
    return json({ message: NotificationCode.NOT_FOUND }, { status: 404 })
  }

  return new Response(file, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="crash_${fileIdResult.data}.log"`
    }
  })
}

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress()
  const tk = getBearerToken(event.request) ?? ''

  if (!(await verifyScopedToken(tk, 'crashreports', { ip }))) {
    console.warn(`Unauthorized crash report submission attempt from IP ${ip}`)
    return json({ message: NotificationCode.UNAUTHORIZED }, { status: 401 })
  }

  if (!crashReportsLimiter.canPerformAction(ip)) {
    console.warn(`Too many crash report submissions from IP ${ip}`)
    return json({ message: NotificationCode.TOO_MANY_REQUESTS }, { status: 429 })
  }

  let body
  try {
    const text = await readLimitedText(event.request, MAX_CRASH_REPORT_BODY_SIZE)
    body = text.trim() ? JSON.parse(text) : {}
  } catch (err) {
    if (err instanceof BusinessError) {
      return json({ message: err.code }, { status: err.httpStatus })
    }
    console.warn(`Invalid JSON body from IP ${ip}:`, err)
    return json({ message: NotificationCode.INVALID_INPUT }, { status: 400 })
  }

  let payload
  try {
    payload = extCrashReportSchema.parse(body ?? {})
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
