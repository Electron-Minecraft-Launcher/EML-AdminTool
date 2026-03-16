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

export async function addProfile(name: string, slug: string, ip?: string, port?: number, tcpProtocol?: string): Promise<void> {
  try {
    await db.profile.create({
      data: {
        name,
        slug,
        ip,
        port,
        tcpProtocol
      }
    })
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

export async function setUserProfilePermission(userId: string, profileId: string, permission: 0 | 1 | 2): Promise<void> {
  try {
    if (permission === 0) {
      await db.userProfilePermission.deleteMany({ where: { userId, profileId } })
    } else {
      await db.userProfilePermission.upsert({
        where: { userId_profileId: { userId, profileId } },
        create: { userId, profileId, permission },
        update: { permission }
      })
    }
  } catch (err) {
    console.error('Failed to set user profile permission:', err)
    throw new ServerError('Failed to set user profile permission', err, NotificationCode.DATABASE_ERROR, 500)
  }
}



