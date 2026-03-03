import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { Bootstrap } from '@prisma/client'
import { db } from './db'
import { getFiles } from './files'

export async function getBootstraps(): Promise<Bootstrap | null> {
  try {
    const bootstraps = await db.bootstrap.findUnique({ where: { id: '1' } })
    return bootstraps
  } catch (err) {
    console.error('Failed to get bootstraps:', err)
    throw new ServerError('Failed to get bootstraps', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateBootstraps(
  newVersion: string,
  existingBootstraps: Bootstrap | null,
  filenames: { win?: string; mac?: string; lin?: string }
): Promise<void> {
  const files = await getFiles('', 'bootstraps')

  const findFileMetadata = (filename: string | undefined, platformSubdir: string) => {
    if (!filename) return undefined
    return files.find((f) => f.name === filename && (f.path.includes(platformSubdir) || f.path === platformSubdir))
  }

  const newWinFile = findFileMetadata(filenames.win, 'win')
  const newMacFile = findFileMetadata(filenames.mac, 'mac')
  const newLinFile = findFileMetadata(filenames.lin, 'lin')

  const data: any = {
    version: newVersion
  }

  if (filenames.win && newWinFile) data.winFile = newWinFile as any
  if (filenames.mac && newMacFile) data.macFile = newMacFile as any
  if (filenames.lin && newLinFile) data.linFile = newLinFile as any

  try {
    if (existingBootstraps) {
      await db.bootstrap.update({
        where: { id: existingBootstraps.id },
        data: data
      })
    } else {
      await db.bootstrap.create({
        data: {
          id: '1',
          version: newVersion,
          winFile: (newWinFile as any) ?? null,
          macFile: (newMacFile as any) ?? null,
          linFile: (newLinFile as any) ?? null
        }
      })
    }
  } catch (err) {
    console.error('Failed to update bootstraps:', err)
    throw new ServerError('Failed to update bootstraps', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
