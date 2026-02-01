import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'
import { ILoaderFormat, ILoaderType, type Loader } from '$lib/utils/db'

export async function getLoader() {
  let loader
  try {
    loader = await db.loader.findFirst()
    return loader as Loader
  } catch (err) {
    console.error('Failed to load loader:', err)
    throw new ServerError('Failed to load loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateLoader(loader: Partial<Loader>) {
  let existingLoader
  try {
    existingLoader = await db.loader.findUnique({ where: { id: '1' } })
  } catch (err) {
    console.error('Failed to fetch existing loader:', err)
    throw new ServerError('Failed to fetch existing loader', err, NotificationCode.DATABASE_ERROR, 500)
  }

  const formattedLoader = {
    id: '1',
    type: loader.type ?? ILoaderType.VANILLA,
    minecraftVersion: loader.minecraftVersion ?? 'latest_release',
    loaderVersion: loader.loaderVersion ?? 'latest_release',
    format: loader.format ?? ILoaderFormat.UNIVERSAL,
    file: (loader.file ?? null) as any
  }

  try {
    if (existingLoader) {
      await db.loader.update({ where: { id: '1' }, data: formattedLoader })
    } else {
      await db.loader.create({ data: formattedLoader })
    }
  } catch (err) {
    console.error('Failed to update loader:', err)
    throw new ServerError('Failed to update loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
