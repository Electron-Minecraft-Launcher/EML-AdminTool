import { dev } from '$app/environment'
import { randomBytes } from 'node:crypto'
import { defaultPgURL, envPath, resetProcessEnv } from './setup'
import fs from 'node:fs'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { Client } from 'pg'
import { deleteFile } from './files'
import { Prisma } from '@prisma/client'

export async function resetDatabase() {
  console.log('\n-------------- RESETTING DATABASE --------------\n')
  resetProcessEnv()

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const tables = Prisma.dmmf.datamodel.models

  if (tables.length > 0) {
    const tableNames = tables.map((t) => `"${t.name}"`).join(', ')

    try {
      await client.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE`)
    } catch (err) {
      console.error(`Error dropping database "eml_admintool":`, err)
      await client.end()
      throw new ServerError(`Failed to drop database "eml_admintool"`, err, NotificationCode.DATABASE_ERROR, 500)
    }
  }

  await client.end()
}

export async function deleteAllFiles() {
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

export async function markAsUnconfigured() {
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

  try {
    if (!fs.existsSync('./env')) fs.mkdirSync('./env')
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
