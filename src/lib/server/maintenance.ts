import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { Maintenance } from '@prisma/client'
import { db } from './db'
import type { MaintenancePayload } from '$lib/utils/db'

export async function getMaintenance(): Promise<Maintenance | null> {
  try {
    const maintenance = await db.maintenance.findUnique({ where: { id: '1' } })
    return maintenance
  } catch (err) {
    console.error('Failed to get maintenance:', err)
    throw new ServerError('Failed to get maintenance', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateMaintenance(maintenance: MaintenancePayload): Promise<void> {
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
      await db.maintenance.create({ data: {
        id: '1',
        startTime: maintenance.startTime,
        endTime: maintenance.endTime,
        message: maintenance.message,
        allowedPseudos: maintenance.allowedPseudos
      } })
    }
  } catch (err) {
    console.error('Failed to update maintenance:', err)
    throw new ServerError('Failed to update maintenance', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
