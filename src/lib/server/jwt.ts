import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { User } from '@prisma/client'
import type { RequestEvent } from '@sveltejs/kit'
import { errors, jwtVerify, SignJWT, type JWTPayload } from 'jose'

export async function createSessionToken(user: User): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
  return new SignJWT({ id: user.id, isAdmin: user.isAdmin }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('365d').sign(secret)
}

export async function createStatsToken(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
  return new SignJWT({ scope: 'stats' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('10m').sign(secret)
}

export function deleteSession(event: RequestEvent): void {
  event.cookies.delete('session', { path: '/' })
}

export async function checkSession(session: string): Promise<JWTPayload> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

  let payload
  try {
    payload = (await jwtVerify(session, secret)).payload
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      console.warn('Session expired:', session)
      throw new BusinessError('Session expired', NotificationCode.AUTH_SESSION_EXPIRED, 401)
    }
    if (err instanceof errors.JWTInvalid) {
      console.warn('Invalid session:', session)
      throw new BusinessError('Invalid session', NotificationCode.AUTH_INVALID_SESSION, 401)
    }
    if (err instanceof errors.JWSSignatureVerificationFailed) {
      console.error('Failed to verify JWS signature:', err)
      throw new BusinessError('Failed to verify JWS signature', NotificationCode.INTERNAL_SERVER_ERROR, 401)
    }
    if (err instanceof errors.JWSInvalid) {
      console.error('Invalid JWS:', err)
      throw new BusinessError('Invalid JWS', NotificationCode.INTERNAL_SERVER_ERROR, 401)
    }

    console.error('Failed to verify session:', err)
    throw new ServerError('Failed to verify session', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }

  return payload
}

export async function verifyStatsToken(token?: string): Promise<boolean> {
  if (!token || token.trim() === '') return false

  const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

  let payload
  try {
    payload = (await jwtVerify(token, secret)).payload
    return payload.scope === 'stats'
  } catch (err) {
    if (
      err instanceof errors.JWTExpired ||
      err instanceof errors.JWTInvalid ||
      err instanceof errors.JWSSignatureVerificationFailed ||
      err instanceof errors.JWSInvalid
    ) {
      console.warn('Invalid stats token:', err)
      return false
    }

    console.error('Failed to verify stats token:', err)
    return false
  }
}
