import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { type User } from '@prisma/client'
import { db } from './db'
import { Prisma } from '@prisma/client'

export async function getUserById(userId: string): Promise<User | null> {
  let user
  try {
    user = await db.user.findUnique({ where: { id: userId } })
  } catch (err) {
    console.error('Error fetching user by ID:', err)
    throw new ServerError('Error fetching user by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }

  if (!user) return null

  return user
}

/**
 * @param user.password Must already be **encrypted** if provided.
 */
export async function updateUser(userId: string, user: Partial<User>): Promise<void> {
  if (user.id) delete user.id // ensure the ID is not updated
  if (user.isAdmin != undefined) delete user.isAdmin // ensure the admin status cannot be changed through this function

  try {
    await db.user.update({ where: { id: userId }, data: user })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`User with ID ${userId} not found`)
      throw new BusinessError('User not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error updating user:', err)
    throw new ServerError('Error updating user', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await getUserById(userId)
  if (!user) {
    console.warn(`User with ID ${userId} not found`)
    throw new BusinessError('User not found', NotificationCode.NOT_FOUND, 404)
  }
  if (user.isAdmin) {
    console.warn(`Cannot delete admin user with ID ${userId}`)
    throw new BusinessError('Cannot delete admin user', NotificationCode.FORBIDDEN, 403)
  }

  try {
    await db.user.delete({ where: { id: userId, isAdmin: false } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`User with ID ${userId} not found`)
      throw new BusinessError('User not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error deleting user:', err)
    throw new ServerError('Error deleting user', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
