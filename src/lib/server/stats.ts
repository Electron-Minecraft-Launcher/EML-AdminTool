import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'

export async function resetStats(): Promise<void> {
  try {
    await db.stat.deleteMany()
  } catch (err) {
    console.error('Error resetting stats:', err)
    throw new ServerError('Error resetting stats', err, NotificationCode.DATABASE_ERROR)
  }
}
