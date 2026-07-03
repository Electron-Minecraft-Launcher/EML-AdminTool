import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'

type StatEvent = 'startup' | 'login' | 'launch' | 'bootstrap'

const statActions = {
  startup: 'STARTUP',
  login: 'LOGIN',
  launch: 'LAUNCH',
  bootstrap: 'BOOTSTRAP'
} as const satisfies Record<StatEvent, string>

export async function addStat(event: StatEvent, value: unknown): Promise<void> {
  try {
    const serialized = JSON.stringify(value)

    await db.stat.create({
      data: {
        action: statActions[event] as never,
        value: serialized === '{}' ? null : serialized
      }
    })
  } catch (err) {
    console.error('Failed to add stat:', err)
    throw new ServerError('Failed to add stat', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function resetStats(): Promise<void> {
  try {
    await db.stat.deleteMany()
  } catch (err) {
    console.error('Error resetting stats:', err)
    throw new ServerError('Error resetting stats', err, NotificationCode.DATABASE_ERROR)
  }
}
