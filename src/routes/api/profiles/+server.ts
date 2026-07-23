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

  let unlockedProfiles: Profile[] = []
  if (token) {
    try {
      const isValid = await verifyScopedToken(token, 'profile')
      const payload = getTokenPayload(token)
      const profile = profiles.find((p) => p.visibility === ProfileVisibility.PROTECTED && p.slug === (payload?.slug ?? null))
      if (isValid && profile) {
        unlockedProfiles.push(profile)
      } else {
        return json({ success: false, message: 'Invalid token scope' }, { status: 401 })
      }
    } catch (err) {
      return json({ success: false, message: 'Invalid token' }, { status: 401 })
    }
  }

  let allowedProfiles: Profile[] = []
  if (pseudo) {
    const filteredProfiles = profiles.filter((profile) => profile.visibility === ProfileVisibility.HIDDEN && profile.allowedPseudos.includes(pseudo))
    allowedProfiles = allowedProfiles.concat(filteredProfiles)
  }

  const mappedUnlockedProfiles = unlockedProfiles.map((profile) => ({
    id: profile.id,
    isDefault: profile.isDefault,
    name: profile.name,
    slug: profile.slug,
    ip: profile.ip,
    port: profile.port,
    tcpProtocol: profile.tcpProtocol,
    visibility: profile.visibility,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    token: token
  }))
  const mappedPublicProfiles = profiles
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
  const mappedAllowedProfiles = allowedProfiles.map((profile) => ({
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
  const mappedProtectedProfiles = profiles
    .filter((profile) => profile.visibility === ProfileVisibility.PROTECTED && !allowedProfiles.some((p) => p.id === profile.id))
    .map((profile) => ({
      id: profile.id,
      isDefault: profile.isDefault,
      name: profile.name,
      slug: profile.slug,
      visibility: profile.visibility
    }))

  const res = {
    success: true,
    profiles: [...mappedUnlockedProfiles, ...mappedPublicProfiles, ...mappedProtectedProfiles, ...mappedAllowedProfiles]
  }
  return json(res)
}

