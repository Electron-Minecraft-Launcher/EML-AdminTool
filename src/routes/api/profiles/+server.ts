import { getProfiles } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
  const pseudo = request.headers.get('pseudo')

  let profiles
  try {
    profiles = await getProfiles()
  } catch (err) {
    return json({ success: false, message: 'Failed to get profiles' }, { status: 500 })
  }

  const res = {
    success: true,
    profiles: profiles
      .filter((profile) => !profile.hidden || (pseudo && profile.allowedPseudos.includes(pseudo)))
      .map((profile) => ({
        id: profile.id,
        isDefault: profile.isDefault,
        name: profile.name,
        slug: profile.slug,
        ip: profile.ip,
        port: profile.port,
        tcpProtocol: profile.tcpProtocol,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }))
  }

  return json(res)
}

