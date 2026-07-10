import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import crypto from 'node:crypto'
import zlib from 'node:zlib'
import { promisify } from 'node:util'
import { db } from './db'
import { deleteFile, uploadFile } from './files'
import type { CrashReportPayload } from '$lib/utils/db'
import { Prisma, type CrashReport } from '@prisma/client'

const gunzip = promisify(zlib.gunzip)

const MAX_UNZIPPED_SIZE = 10 * 1024 * 1024

export async function getCrashReportById(crashReportId: string): Promise<CrashReport | null> {
  let crashReport
  try {
    crashReport = await db.crashReport.findUnique({ where: { id: crashReportId } })
    return crashReport
  } catch (err) {
    console.error('Error fetching crash report by ID:', err)
    throw new ServerError('Error fetching crash report by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getCrashReportByFileId(fileId: string): Promise<CrashReport | null> {
  try {
    return await db.crashReport.findUnique({ where: { fileId } })
  } catch (err) {
    console.error('Error fetching crash report by file ID:', err)
    throw new ServerError('Error fetching crash report by file ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addCrashReport(metadata: CrashReportPayload, logData: string): Promise<void> {
  try {
    const compressedBuffer = Buffer.from(logData, 'base64')
    const unzippedBuffer = await gunzip(compressedBuffer, {
      maxOutputLength: MAX_UNZIPPED_SIZE
    })

    const fileId = crypto.randomUUID()
    const fileName = `crash_${fileId}.log`

    const file = new File([unzippedBuffer], fileName, { type: 'text/plain' })
    await uploadFile('crash-reports', '', file)

    await db.crashReport.create({
      data: {
        date: metadata.date,
        os: metadata.os,
        arch: metadata.arch,
        javaVersion: metadata.javaVersion,
        javaArch: metadata.javaArch,
        authType: metadata.authType,
        profile: metadata.profile,
        version: metadata.version,
        loader: metadata.loader,
        loaderVersion: metadata.loaderVersion,
        minRam: metadata.minRam,
        maxRam: metadata.maxRam,
        exitCode: metadata.exitCode,
        fileId: fileId
      }
    })
  } catch (err: any) {
    console.error('Failed to add crash report:', err)

    if (err instanceof BusinessError || err instanceof ServerError) {
      throw err
    }

    if (err.code === 'ERR_ZLIB_BINDING_CLOSED' || err.message?.includes('maxOutputLength')) {
      throw new BusinessError('Invalid or too large log file', NotificationCode.INVALID_REQUEST, 400)
    }

    throw new ServerError('Failed to add crash report', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateCrashReport(crashReport: { id: string; comment?: string | null; addressed?: boolean | null }): Promise<void> {
  try {
    const { id, comment, addressed } = crashReport

    if (addressed === true) {
      await db.crashReport.update({
        where: { id },
        data: {
          addressedAt: new Date(),
          comment
        }
      })
    } else if (addressed === false) {
      await db.crashReport.update({
        where: { id },
        data: {
          addressedAt: null,
          comment
        }
      })
    } else {
      await db.crashReport.update({
        where: { id },
        data: {
          comment
        }
      })
    }
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`Crash report with ID ${crashReport.id} not found`)
      throw new BusinessError('Crash report not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit crash report:', err)
    throw new ServerError('Failed to edit crash report', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteCrashReport(crashReportId: string): Promise<void> {
  try {
    const report = await db.crashReport.findUnique({ where: { id: crashReportId } })

    if (!report) {
      throw new BusinessError('Crash report not found', NotificationCode.NOT_FOUND, 404)
    }

    await db.crashReport.delete({ where: { id: crashReportId } })
    const fileName = `crash_${report.fileId}.log`

    await deleteFile('crash-reports', fileName, false)
  } catch (err: any) {
    console.error('Failed to delete crash report:', err)

    if (err instanceof BusinessError || err instanceof ServerError) {
      throw err
    }

    throw new ServerError('Failed to delete crash report', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
