import { verifyStatsToken } from '$lib/server/jwt'
import { canRecordStat } from '$lib/server/stats'
import { NotificationCode } from '$lib/utils/notifications'
import { statSchemas } from '$lib/utils/validations'
import { json, type RequestHandler } from '@sveltejs/kit'
import { ZodError } from 'zod/v4'

export const POST: RequestHandler = async (event) => {
  const ip = event.getClientAddress()
  const ev = event.params.event ?? ''
  const tk = getBearerToken(event.request) ?? ''

  if (!(ev in statSchemas)) {
    console.warn(`Invalid stat event: ${ev} from IP ${ip}`)
    return json({ message: NotificationCode.NOT_FOUND }, { status: 404 })
  }

  if (await verifyStatsToken(tk)) {
    return json({ message: NotificationCode.UNAUTHORIZED }, { status: 401 })
  }

  if (!canRecordStat(ip)) {
    return json({ message: 'Too Many Requests' }, { status: 429 })
  }

  let body
  try {
    body = await readJsonBody(event.request)
  } catch (err) {
    console.warn(`Invalid JSON body from IP ${ip}:`, err)
    return json({ message: NotificationCode.INVALID_INPUT }, { status: 400 })
  }

  let payload
  try {
    payload = statSchemas[ev as keyof typeof statSchemas].parse(body ?? {})
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn(`Invalid request body for event ${ev} from IP ${ip}:`, err.issues)
      return json({ message: NotificationCode.INVALID_INPUT, issues: err.issues }, { status: 400 })
    }
    console.error(`Unexpected error validating request body for event ${ev} from IP ${ip}:`, err)
    return json({ message: NotificationCode.INTERNAL_SERVER_ERROR }, { status: 500 })
  }

  // const token = getBearerToken(request)
  // if (!token || !(await verifyStatsToken(token))) {
  //   return json({ message: 'Unauthorized' }, { status: 401 })
  // }

  // if (!canRecordStat(getClientAddress())) {
  //   return json({ message: 'Too Many Requests' }, { status: 429 })
  // }

  // let body: unknown
  // try {
  //   body = await readJsonBody(request)
  // } catch {
  //   return json({ message: 'Invalid JSON body' }, { status: 400 })
  // }

  // let payload: unknown
  // try {
  //   payload = validateStatPayload(event, body)
  // } catch (err) {
  //   if (err instanceof ZodError) return json({ message: 'Invalid request body', issues: err.issues }, { status: 400 })
  //   return json({ message: 'Invalid request body' }, { status: 400 })
  // }

  // try {
  //   await recordStat(event, payload)
  // } catch (err) {
  //   console.error('Failed to record stat:', err)
  //   return json({ message: 'Internal Server Error' }, { status: 500 })
  // }

  return new Response(null, { status: 204 })
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text()
  if (!text.trim()) return {}
  return JSON.parse(text)
}
