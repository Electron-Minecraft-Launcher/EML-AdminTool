import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { randomBytes } from 'crypto'
import { db } from './db'

export function generateRandomPin(): string {
  return (randomBytes(2).readUInt16BE(0) % 1000).toString().padStart(3, '0')
}

export async function getPin(): Promise<string> {
  let pin
  try {
    pin = (await db.environment.findFirst({ select: { pin: true } }))!.pin
    return pin
  } catch (err) {
    console.error('Error fetching PIN from database:', err)
    throw new ServerError('Failed to fetch PIN from database', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function checkPin(pin: string): Promise<boolean> {
  return (await getPin()) === pin
}
