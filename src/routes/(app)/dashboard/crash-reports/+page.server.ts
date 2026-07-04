import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'

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
    // select the most crash-prone profile (the one with the most crash reports)
    const crashProneProfile = (await db.crashReport.groupBy({
      by: ['profile'],
      _count: { profile: true },
      orderBy: { _count: { profile: 'desc' } },
      take: 1
    }))[0]?.profile || '-'

    return { crashReports, page, count, unadressed, crashProneProfile }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })
    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad
