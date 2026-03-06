import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { Maintenance } from '@prisma/client'
import { db } from './db'

export async function getMaintenance() {
  try {
    const maintenance = await db.maintenance.findUnique({ where: { id: '1' } })
    return maintenance
  } catch (err) {
    console.error('Failed to get maintenance:', err)
    throw new ServerError('Failed to get maintenance', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateMaintenance(maintenance: Maintenance) {
  let existingMaintenance
  try {
    existingMaintenance = await db.maintenance.findUnique({ where: { id: '1' } })
  } catch (err) {
    console.error('Failed to fetch existing maintenance:', err)
    throw new ServerError('Failed to fetch existing maintenance', err, NotificationCode.DATABASE_ERROR, 500)
  }

  try {
    if (existingMaintenance) {
      await db.maintenance.update({ where: { id: '1' }, data: maintenance })
    } else {
      await db.maintenance.create({ data: maintenance })
    }
  } catch (err) {
    console.error('Failed to update maintenance:', err)
    throw new ServerError('Failed to update maintenance', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
