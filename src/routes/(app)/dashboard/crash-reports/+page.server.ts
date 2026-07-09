import { error, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { fail } from '$lib/server/action'
import { crashReportSchema } from '$lib/utils/validations'
import { deleteCrashReport, getCrashReportById, updateCrashReport } from '$lib/server/crashreports'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.p_crashReports) {
    throw redirect(303, '/dashboard')
  }

  const page = parseInt(event.url.searchParams.get('page') || '1')

  try {
    const crashReports = await db.crashReport.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 25,
      take: 25
    })

    const count = await db.crashReport.count()

    const unadressed = await db.crashReport.count({ where: { addressedAt: null } })

    const profiles = await db.profile.findMany({
      select: { id: true, name: true, slug: true, isDefault: true }
    })

    const defaultProfile = profiles.find((p) => p.isDefault)!

    let crashProneProfile =
      (
        await db.crashReport.groupBy({
          by: ['profile'],
          _count: { profile: true },
          orderBy: { _count: { profile: 'desc' } },
          take: 1
        })
      )[0]?.profile || defaultProfile.slug

    const profile = profiles.find((p) => p.slug === crashProneProfile)
    crashProneProfile = profile?.name ?? defaultProfile.name

    const mappings: Record<string, string> = {
      '-': '-',
      win: 'Windows',
      mac: 'macOS',
      linux: 'Linux',
      crack: 'Cracked',
      msa: 'Microsoft',
      azauth: 'AzAuth',
      yggdrasil: 'Yggdrasil',
      ...Object.fromEntries(profiles.map((p) => [p.slug, p.name]))
    }
    for (const cr of crashReports) {
      const profile = profiles.find((p) => p.slug === cr.profile)
      cr.profile = profile?.name ?? defaultProfile.name
      cr.os = mappings[cr.os] ?? cr.os
      cr.authType = mappings[cr.authType] ?? cr.authType
    }

    return { crashReports, page, count, unadressed, crashProneProfile }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })
    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  editCrashReport: async (event) => {
    const user = event.locals.user

    if (!user?.p_crashReports) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const raw = {
      crashReportId: form.get('crash-report-id'),
      comment: form.get('comment'),
      addressed: form.get('addressed') === 'true' ? true : form.get('addressed') === 'false' ? false : null
    }

    const result = crashReportSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { crashReportId, comment, addressed } = result.data

    try {
      await updateCrashReport({ id: crashReportId, comment, addressed })
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteCrashReports: async (event) => {
    const user = event.locals.user

    if (user?.p_crashReports !== 2) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const crashReportId = form.getAll('crash-report-id')

    try {
      for (const id of crashReportId) {
        if (typeof id !== 'string') continue

        const crashReport = await getCrashReportById(id)
        if (!crashReport) {
          console.warn(`Crash report with ID ${id} not found`)
          throw new BusinessError('Crash report not found', NotificationCode.NOT_FOUND, 404)
        }

        await deleteCrashReport(id)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}
