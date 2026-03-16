import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'
import { ILoaderFormat, ILoaderType } from '$lib/utils/db'
import type { Loader } from '@prisma/client'

export const defaultLoader = {
  success: true,
  type: ILoaderType.VANILLA,
  minecraftVersion: 'latest_release',
  loaderVersion: 'latest_release',
  format: ILoaderFormat.CLIENT,
  file: null,
  updatedAt: new Date()
}

export async function getLoader(profileId: string = '1'): Promise<Loader | null> {
  let loader
  try {
    loader = await db.loader.findFirst({ where: { profileId } })
    return loader as Loader
  } catch (err) {
    console.error('Failed to load loader:', err)
    throw new ServerError('Failed to load loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateLoader(profileId: string = '1', loader: Partial<Loader>): Promise<void> {
  let existingLoader
  try {
    existingLoader = await db.loader.findFirst({ where: { profileId } })
  } catch (err) {
    console.error('Failed to fetch existing loader:', err)
    throw new ServerError('Failed to fetch existing loader', err, NotificationCode.DATABASE_ERROR, 500)
  }

  const formattedLoader = {
    type: loader.type ?? ILoaderType.VANILLA,
    minecraftVersion: loader.minecraftVersion ?? 'latest_release',
    loaderVersion: loader.loaderVersion ?? 'latest_release',
    format: loader.format ?? ILoaderFormat.UNIVERSAL,
    file: (loader.file ?? null) as any,
    profileId
  }

  try {
    if (existingLoader) {
      await db.loader.update({ where: { id: existingLoader.id }, data: formattedLoader })
    } else {
      await db.loader.create({ data: formattedLoader })
    }
  } catch (err) {
    console.error('Failed to update loader:', err)
    throw new ServerError('Failed to update loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}


