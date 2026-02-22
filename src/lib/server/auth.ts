import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'
import bcrypt from 'bcrypt'
import { checkSession } from './jwt'
import { checkPin } from './pin'
import { Prisma } from '@prisma/client'
import { IUserStatus } from '$lib/utils/db'

export async function login(username: string, password: string) {
  let user
  try {
    user = await db.user.findUnique({ where: { username } })
  } catch (err) {
    console.error('Error fetching user:', err)
    throw new ServerError('Failed to fetch user', err, NotificationCode.DATABASE_ERROR, 500)
  }

  if (!user || user.status == IUserStatus.DELETED) {
    console.warn('User not found or deleted:', username)
    throw new BusinessError('User not found', NotificationCode.LOGIN_BAD_CREDENTIALS, 401)
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    console.warn('Invalid password for user:', username)
    throw new BusinessError('Invalid password', NotificationCode.LOGIN_BAD_CREDENTIALS, 401)
  }

  return user
}

export async function verify(session: string) {
  const payload = await checkSession(session)

  let existing
  try {
    existing = await db.user.findUnique({ where: { id: payload.id as string } })
  } catch (err) {
    console.error('Error verifying user:', err)
    throw new ServerError('Failed to verify user', err, NotificationCode.DATABASE_ERROR, 500)
  }

  if (!existing) {
    console.warn('User not found for session:', session)
    throw new BusinessError('User not found', NotificationCode.UNAUTHORIZED, 401)
  }

  return existing
}

export async function register(username: string, password: string, pin: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const status = (await checkPin(pin)) ? IUserStatus.PENDING : IUserStatus.SPAM

  let user
  try {
    user = await db.user.create({
      data: { username, password: hashedPassword, status }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn('Failed to create user: username already exists:', username)
      throw new BusinessError('Username already exists', NotificationCode.REGISTER_USERNAME_EXISTS, 409)
    } else {
      console.error('Error creating user:', err)
      throw new ServerError('Failed to create user', err, NotificationCode.DATABASE_ERROR, 500)
    }
  }

  return user
}

export async function logout(session: string) {
  try {
    await checkSession(session)
  } catch (err) {
    console.warn('Invalid session during logout:', err)
    throw new BusinessError('Invalid session', NotificationCode.AUTH_INVALID_SESSION, 401)
  }

  try {
    await db.expiredToken.create({ data: { token: session } })
  } catch (err) {
    console.error('Error logging out user:', err)
    throw new ServerError('Failed to log out user', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
