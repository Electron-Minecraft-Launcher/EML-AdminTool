import type { LanguageCode } from '$lib/stores/language'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'
import type { EnvironmentPayload } from '$lib/utils/db'

export async function editEMLAT(environment: EnvironmentPayload): Promise<void> {
  try {
    await db.environment.update({
      where: { id: '1' },
      data: { name: environment.name, language: environment.language as LanguageCode, pin: environment.pin }
    })
  } catch (err) {
    console.error('Error updating EMLAT:', err)
    throw new ServerError('Failed to update EMLAT', err, NotificationCode.DATABASE_ERROR, 500)
  }

  try {
    await db.user.update({
      where: { isAdmin: true, id: '1' },
      data: { username: environment.name }
    })
  } catch (err) {
    console.error('Error updating admin user:', err)
    throw new ServerError('Failed to update admin user', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

/**
 * This function **does not** update the admin username.
 */
export async function editEMLATName(name: string): Promise<void> {
  try {
    await db.environment.update({
      where: { id: '1' },
      data: { name }
    })
  } catch (err) {
    console.error('Error updating EMLAT name:', err)
    throw new ServerError('Failed to update EMLAT name', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

