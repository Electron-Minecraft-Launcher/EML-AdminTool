import { getProfiles } from '$lib/server/profile'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getBearerToken, verifyScopedToken, getTokenPayload } from '$lib/server/jwt'
import { ProfileVisibility, type Profile } from '@prisma/client'

export const GET: RequestHandler = async ({ request }) => {
  const pseudo = request.headers.get('pseudo')
  const token = getBearerToken(request)

  let profiles
  try {
    profiles = await getProfiles()
  } catch (err) {
    return json({ success: false, message: 'Failed to get profiles' }, { status: 500 })
  }

  let meta = {}
  let extraProfiles: Profile[] = []
  if (token) {
    try {
      const isValid = await verifyScopedToken(token, 'profile')
      const payload = getTokenPayload(token)
      const profile = profiles.find((p) => p.visibility === ProfileVisibility.PROTECTED && p.slug === (payload?.slug ?? null))
      if (isValid && profile) {
        extraProfiles.push(profile)
      } else {
        meta = { success: false, message: 'Invalid token scope' }
      }
    } catch (err) {
      meta = { success: false, message: 'Invalid token' }
    }
  }

  if (pseudo) {
    const filteredProfiles = profiles.filter(
      (profile) => profile.visibility === ProfileVisibility.HIDDEN && profile.allowedPseudos.includes(pseudo)
    )
    extraProfiles = extraProfiles.concat(filteredProfiles)
  }

  const additionalProfiles = extraProfiles.map((profile) => ({
    id: profile.id,
    isDefault: profile.isDefault,
    name: profile.name,
    slug: profile.slug,
    ip: profile.ip,
    port: profile.port,
    tcpProtocol: profile.tcpProtocol,
    visibility: profile.visibility,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  }))
  const publicProfiles = profiles
    .filter((profile) => profile.visibility === ProfileVisibility.PUBLIC)
    .map((profile) => ({
      id: profile.id,
      isDefault: profile.isDefault,
      name: profile.name,
      slug: profile.slug,
      ip: profile.ip,
      port: profile.port,
      tcpProtocol: profile.tcpProtocol,
      visibility: profile.visibility,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }))
  const protectedProfiles = profiles
    .filter((profile) => profile.visibility === ProfileVisibility.PROTECTED && !extraProfiles.some((p) => p.id === profile.id))
    .map((profile) => ({
      id: profile.id,
      isDefault: profile.isDefault,
      name: profile.name,
      slug: profile.slug,
      visibility: profile.visibility
    }))

  const res = { success: true, ...meta, profiles: [...publicProfiles, ...protectedProfiles, ...additionalProfiles] }

  return json(res)
}
