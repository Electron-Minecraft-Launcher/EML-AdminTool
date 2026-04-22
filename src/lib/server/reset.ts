import { dev } from '$app/environment'
import { randomBytes } from 'node:crypto'
import { defaultPgURL, envPath, resetProcessEnv } from './setup'
import fs from 'node:fs'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { deleteFile } from './files'
import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

export async function resetDatabase(): Promise<void> {
  console.log('\n-------------- RESETTING DATABASE --------------\n')
  resetProcessEnv()

  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userProfilePermission.deleteMany()
      await tx.loader.deleteMany()
      await tx.log.deleteMany()
      await tx.news.deleteMany()
      await tx.newsCategory.deleteMany()
      await tx.newsTag.deleteMany()
      await tx.stat.deleteMany()
      await tx.expiredToken.deleteMany()
      await tx.background.deleteMany()
      await tx.bootstrap.deleteMany()
      await tx.maintenance.deleteMany()
      await tx.profile.deleteMany()
      await tx.user.deleteMany()
      await tx.environment.deleteMany()
      await tx.systemMigration.deleteMany()
    })
  } catch (err) {
    console.error('Error resetting database:', err)
    throw new ServerError('Failed to reset database', err, NotificationCode.DATABASE_ERROR, 500)
  } finally {
    await prisma.$disconnect()
  }
}

export async function deleteAllFiles(): Promise<void> {
  console.log('\n---------------- DELETING FILES ----------------\n')
  try {
    await deleteFile('files-updater', '')
  } catch (err) {
    console.error('Failed to delete files in "files-updater":', err)
  }
  try {
    await deleteFile('bootstraps', '')
  } catch (err) {
    console.error('Failed to delete files in "bootstraps":', err)
  }
  try {
    await deleteFile('backgrounds', '')
  } catch (err) {
    console.error('Failed to delete files in "backgrounds":', err)
  }
  try {
    await deleteFile('images', '')
  } catch (err) {
    console.error('Failed to delete files in "images":', err)
  }
  try {
    await deleteFile('cache', '')
  } catch (err) {
    console.error('Failed to delete files in "cache":', err)
  }
}

export async function markAsUnconfigured(): Promise<void> {
  console.log('\n-------------- UPDATING ENV FILE ---------------\n')
  resetProcessEnv()
  const databaseUrl = process.env.DATABASE_URL ?? defaultPgURL
  const jwtSecretKey = process.env.JWT_SECRET_KEY ?? randomBytes(64).toString('base64url')

  const envFile = envPath

  const devWarning = dev
    ? `
# # # # # # # # # # # # # # # # # # # # # # # # # # # #
#       FAKE ENVIRONMENT VARIABLES FOR TESTING        #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #
`
    : ''

  const newEnv = `# # # # # # # # # # # # # # # # # # # # # # # # # # # #
#          DO NOT MODIFY OR DELETE THIS FILE          #
#                                                     #
# This file contains important environment variables  #
# for your application, including the password for    #
# your database and a JWT key. Modifying or deleting  #
# this file would break your application and          #
# compromise its security.                            #
#                                                     #
# If you need to change any of these values, please   #
# use the appropriate configuration options rather    #
# than modifying this file directly.                  #
# Consult the documentation for more information.     #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #
${devWarning}
IS_CONFIGURED="false"
DATABASE_URL="${databaseUrl}"
JWT_SECRET_KEY="${jwtSecretKey}"
BODY_SIZE_LIMIT=Infinity`

  const envDirectory = path.dirname(envPath)

  try {
    if (!fs.existsSync(envDirectory)) fs.mkdirSync(envDirectory, { recursive: true })
  } catch (err) {
    console.error('Error creating env directory:', err)
    throw new ServerError('Failed to create env directory', err, NotificationCode.FILE_SYSTEM_ERROR, 500)
  }

  try {
    fs.writeFileSync(envFile, newEnv)
  } catch (err) {
    console.error('Error writing to env file:', err)
    throw new ServerError('Failed to write to env file', err, NotificationCode.FILE_SYSTEM_ERROR, 500)
  }

  resetProcessEnv()

  console.log('Environment file updated successfully.')
}
