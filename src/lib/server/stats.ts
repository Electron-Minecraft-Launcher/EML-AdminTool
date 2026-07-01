import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'

const WINDOW_MS = 10 * 60 * 1000
const STATS_LIMIT = 10

type StatEvent = 'startup' | 'login' | 'launch' | 'bootstrap'
type RateWindow = {
  expiresAt: number
  count: number
}

const handshakeCooldowns = new Map<string, number>()
const statsWindows = new Map<string, RateWindow>()

const statActions = {
  startup: 'STARTUP',
  login: 'LOGIN',
  launch: 'LAUNCH',
  bootstrap: 'BOOTSTRAP'
} as const satisfies Record<StatEvent, string>

export function canCreateHandshakeToken(ip: string, now = Date.now()): boolean {
  const expiresAt = handshakeCooldowns.get(ip)
  if (expiresAt && expiresAt > now) return false
  return true
}

export function registerHandshakeToken(ip: string, now = Date.now()): void {
  handshakeCooldowns.set(ip, now + WINDOW_MS)
}

export function canRecordStat(ip: string, now = Date.now()): boolean {
  const window = statsWindows.get(ip)

  if (!window || window.expiresAt <= now) {
    statsWindows.set(ip, { count: 1, expiresAt: now + WINDOW_MS })
    return true
  }

  if (window.count >= STATS_LIMIT) return false

  window.count += 1
  return true
}

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
