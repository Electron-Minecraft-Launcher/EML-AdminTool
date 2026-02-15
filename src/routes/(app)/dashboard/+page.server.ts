import { error, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { logout } from '$lib/server/auth'
import { deleteSession } from '$lib/server/jwt'
import { getServerStatus, type ServerStatus as ServerStatus_ } from '$lib/server/serverstatus'
import { db } from '$lib/server/db'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { Instance } from '@prisma/client'

type ServerStatus = ServerStatus_ & { name: string }
type LauncherStatus = {
  version: string
  maintenance: 'on' | 'off' | 'scheduled'
  scheduledStartTime: Date | null
}

export const load = (async (event) => {
  let timeInfo = { time: Date.now(), zone: Intl.DateTimeFormat().resolvedOptions().timeZone }
  let serverStatus: ServerStatus | null = null
  let launcherStatus: LauncherStatus | null = null
  let instance: Instance | null = null
  let maintenance
  let bootstraps

  try {
    try {
      instance = await db.instance.findFirst({ where: { isDefault: true } })
    } catch (err) {
      console.error('Failed to load default instance:', err)
      throw new ServerError('Failed to load default instance', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      maintenance = await db.maintenance.findFirst()
    } catch (err) {
      console.error('Failed to load maintenance:', err)
      throw new ServerError('Failed to load maintenance', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      bootstraps = await db.bootstrap.findUnique({ where: { id: '1' } })
    } catch (err) {
      console.error('Failed to load bootstraps:', err)
      throw new ServerError('Failed to load bootstraps', err, NotificationCode.DATABASE_ERROR, 500)
    }

    const pingServer = async () => {
      if (instance?.ip && instance?.port && instance?.tcpProtocol) {
        try {
          return {
            ...(await getServerStatus(instance.ip, instance.port, instance.tcpProtocol as 'modern' | '1.6' | '1.4-1.5')),
            name: instance.name
          }
        } catch (err) {
          console.error('Failed to get server status:', err)
          return {
            name: instance.name,
            ping: Infinity,
            version: '',
            motd: '',
            players: { max: 0, online: 0 }
          }
        }
      } else {
        return null
      }
    }

    if (instance?.ip && instance?.port && instance?.tcpProtocol) {
      serverStatus = {
        name: instance?.name ?? 'N/A',
        ping: -1,
        version: 'N/A',
        motd: 'N/A',
        players: { max: 0, online: 0 }
      }
    } else {
      serverStatus = null
    }

    launcherStatus = {
      version: bootstraps?.version ?? '-',
      maintenance: maintenance?.startTime && maintenance?.endTime ? (maintenance!.startTime > new Date() ? 'scheduled' : 'on') : 'off',
      scheduledStartTime: maintenance?.startTime ?? null
    }

    return { timeInfo, serverStatus, launcherStatus, streamed: { pingServer: pingServer() } }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  logout: async (event) => {
    const session = event.cookies.get('session') ?? ''

    try {
      await logout(session)
      deleteSession(event)
    } catch (err) {
      console.error('Failed to logout:', err)
      event.cookies.delete('session', { path: '/' })
    }
  }
}
