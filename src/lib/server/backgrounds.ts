import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'
import type { File as File_ } from '../utils/types.d'
import { Prisma } from '@prisma/client'
import { IBackgroundStatus } from '$lib/utils/db'
import type { BackgroundStatus } from '@prisma/client'

export async function getActiveBackground() {
  let background
  try {
    background = await db.background.findFirst({ where: { status: IBackgroundStatus.ACTIVE } })
    return background
  } catch (err) {
    console.error('Failed to get active background:', err)
    throw new ServerError('Failed to get active background', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getBackgroundById(backgroundId: string) {
  let background
  try {
    background = await db.background.findUnique({ where: { id: backgroundId } })
    return background
  } catch (err) {
    console.error('Error fetching background by ID:', err)
    throw new ServerError('Error fetching background by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addBackground(name: string, file: File_, status: BackgroundStatus) {
  if (status === IBackgroundStatus.ACTIVE) {
    await disableAllBackgrounds()
  }

  try {
    await db.background.create({
      data: {
        name,
        file: file as any,
        status
      }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`Background with name ${name} already exists`)
      throw new BusinessError('Background already exists', NotificationCode.BACKGROUND_ALREADY_EXISTS, 400)
    }
    console.error('Failed to add background:', err)
    throw new ServerError('Failed to add background', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function enableBackground(backgroundId: string) {
  await disableAllBackgrounds()

  try {
    await db.background.update({
      where: { id: backgroundId },
      data: { status: IBackgroundStatus.ACTIVE }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`Background with ID ${backgroundId} not found`)
      throw new BusinessError('Background not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit background:', err)
    throw new ServerError('Failed to edit background', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function disableAllBackgrounds() {
  try {
    await db.background.updateMany({ data: { status: IBackgroundStatus.INACTIVE } })
  } catch (err) {
    console.error('Failed to set all backgrounds to inactive:', err)
    throw new ServerError('Failed to set all backgrounds to inactive', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateBackground(backgroundId: string, name: string) {
  try {
    await db.background.update({
      where: { id: backgroundId },
      data: { name }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`Background with name ${name} already exists`)
      throw new BusinessError('Background already exists', NotificationCode.BACKGROUND_ALREADY_EXISTS, 400)
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`Background with ID ${backgroundId} not found`)
      throw new BusinessError('Background not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit background:', err)
    throw new ServerError('Failed to edit background', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteBackground(backgroundId: string) {
  try {
    await db.background.delete({ where: { id: backgroundId } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`Background with ID ${backgroundId} not found`)
      throw new BusinessError('Background not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error deleting background:', err)
    throw new ServerError('Error deleting background', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
