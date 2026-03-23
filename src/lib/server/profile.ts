import { db } from './db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { Prisma, type Profile } from '@prisma/client'

export async function getProfiles(limit: number = 20): Promise<Profile[]> {
  let profiles
  try {
    profiles = await db.profile.findMany({
      take: limit,
      orderBy: { name: 'asc' }
    })
    return profiles
  } catch (err) {
    console.error('Failed to get profiles:', err)
    throw new ServerError('Failed to get profiles', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getDefaultProfile(): Promise<Profile | null> {
  try {
    return await db.profile.findFirst({ where: { isDefault: true } })
  } catch (err) {
    console.error('Failed to get default profile:', err)
    throw new ServerError('Failed to get default profile', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getProfileById(profileId: string): Promise<Profile | null> {
  let profile
  try {
    profile = await db.profile.findUnique({ where: { id: profileId } })
    return profile
  } catch (err) {
    console.error('Error fetching profile by ID:', err)
    throw new ServerError('Error fetching profile by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  try {
    return await db.profile.findUnique({ where: { slug } })
  } catch (err) {
    console.error('Failed to get profile by slug:', err)
    throw new ServerError('Failed to get profile by slug', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addProfile(name: string, slug: string, ip?: string, port?: number, tcpProtocol?: string): Promise<string> {
  try {
    const res = await db.profile.create({
      data: {
        name,
        slug,
        ip,
        port,
        tcpProtocol
      }
    })
    return res.id
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`Profile with slug ${slug} already exists`)
      throw new BusinessError('Profile already exists', NotificationCode.PROFIL_ALREADY_EXISTS, 400)
    }
    console.error('Failed to add profile:', err)
    throw new ServerError('Failed to add profile', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateProfile(profileId: string, name: string, slug: string, ip?: string, port?: number, tcpProtocol?: string): Promise<void> {
  try {
    await db.profile.update({
      where: { id: profileId },
      data: {
        name,
        slug,
        ip,
        port,
        tcpProtocol
      }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`Profile with ID ${profileId} not found`)
      throw new BusinessError('Profile not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit profile:', err)
    throw new ServerError('Failed to edit profile', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteProfile(profileId: string): Promise<void> {
  try {
    await db.profile.delete({ where: { id: profileId } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`Profile with ID ${profileId} not found`)
      throw new BusinessError('Profile not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error deleting profile:', err)
    throw new ServerError('Error deleting profile', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getUserProfilePermissions(userId: string): Promise<{ profileId: string; permission: number }[]> {
  try {
    return await db.userProfilePermission.findMany({
      where: { userId },
      select: { profileId: true, permission: true }
    })
  } catch (err) {
    console.error('Failed to get user profile permissions:', err)
    throw new ServerError('Failed to get user profile permissions', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

/**
 * Called from the Profile page modal.
 */
export async function updateProfileUserPermissions(profileId: string, permissions: { userId: string; permission: 0 | 1 | 2 }[]): Promise<void> {
  try {
    await db.$transaction([
      db.userProfilePermission.deleteMany({ where: { profileId } }),
      ...permissions
        .filter((p) => p.permission > 0)
        .map((p) =>
          db.userProfilePermission.create({
            data: { profileId, userId: p.userId, permission: p.permission }
          })
        )
    ])
  } catch (err) {
    console.error('Failed to set profile user permissions:', err)
    throw new ServerError('Failed to set profile user permissions', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

/**
 * Called from the Settings page modal.
 */
export async function updateUserProfilePermissions(userId: string, permissions: { profileId: string; permission: 0 | 1 | 2 }[]): Promise<void> {
  try {
    await db.$transaction([
      db.userProfilePermission.deleteMany({ where: { userId } }),
      ...permissions
        .filter((p) => p.permission > 0)
        .map((p) =>
          db.userProfilePermission.create({
            data: { userId, profileId: p.profileId, permission: p.permission }
          })
        )
    ])
  } catch (err) {
    console.error('Failed to set user profile permissions:', err)
    throw new ServerError('Failed to set user profile permissions', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getAccessibleProfiles(userId: string, isAdmin: boolean): Promise<Profile[]> {
  if (isAdmin) {
    return getProfiles()
  }

  try {
    const permissions = await db.userProfilePermission.findMany({
      where: { userId, permission: { gt: 0 } },
      select: { profileId: true }
    })

    const profileIds = permissions.map((p) => p.profileId)

    return await db.profile.findMany({
      where: { id: { in: profileIds } },
      orderBy: { name: 'asc' }
    })
  } catch (err) {
    console.error('Failed to get accessible profiles:', err)
    throw new ServerError('Failed to get accessible profiles', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

/**
 * Resolves a profile by its ID, checking the user's permissions.
 * @param profileId
 * @param userId
 * @param isAdmin Whether the user is an admin. If true, permissions won't be checked.
 * @param minPermission `1` the user must have at least Files Updater permissions, `2` the user must have at least Files Updater and Loader permissions. Default is `1`.
 * @returns
 */
export async function resolveProfile(profileId: string, userId: string, isAdmin: boolean, minPermission: 1 | 2 = 1): Promise<Profile> {
  const profile = await getProfileById(profileId)

  if (!profile) {
    throw new BusinessError('Profile not found', NotificationCode.NOT_FOUND, 404)
  }

  if (!isAdmin) {
    let permission
    try {
      permission = await db.userProfilePermission.findUnique({ where: { userId_profileId: { userId, profileId } } })
    } catch (err) {
      console.error('Failed to check profile permission:', err)
      throw new ServerError('Failed to check profile permission', err, NotificationCode.DATABASE_ERROR, 500)
    }

    if (!permission || permission.permission < minPermission) {
      throw new BusinessError('Forbidden', NotificationCode.FORBIDDEN, 403)
    }
  }

  return profile
}

