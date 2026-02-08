import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { logout } from '$lib/server/auth'
import { deleteSession } from '$lib/server/jwt'
import { getServerStatus, type ServerStatus } from '$lib/server/serverstatus'

export const load = (async (event) => {
  return {}
}) satisfies PageServerLoad

export const actions: Actions = {
  logout: async (event) => {
    const session = event.cookies.get('session') ?? ''

    let serverStatus: ServerStatus | null = null
    if (event.locals.env.serverIp) {
      const [ip, port, protocol] = ""
      if (ip && port && protocol) {
        try {
          serverStatus = await getServerStatus(ip, port ? Number(port) : undefined, protocol as 'modern' | '1.6' | '1.4-1.5')
        } catch (err) {
          console.error('Failed to get server status:', err)
        }
      }
    }

    try {
      await logout(session)
      deleteSession(event)
    } catch (err) {
      console.error('Failed to logout:', err)
      event.cookies.delete('session', { path: '/' })
    }
  }
}
