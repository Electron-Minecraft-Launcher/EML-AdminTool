import { db } from './db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { Prisma } from '@prisma/client'

export async function getProfiles(limit: number = 20) {
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

export async function getProfileById(profileId: string) {
  let profile
  try {
    profile = await db.profile.findUnique({ where: { id: profileId } })
    return profile
  } catch (err) {
    console.error('Error fetching profile by ID:', err)
    throw new ServerError('Error fetching profile by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addProfile(name: string, slug: string, ip?: string, port?: number, tcpProtocol?: string) {
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

export async function updateProfile(profileId: string, name: string, slug: string, ip?: string, port?: number, tcpProtocol?: string) {
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

export async function deleteProfile(profileId: string) {
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
