import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { NotificationCode } from '$lib/utils/notifications'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { resetStats } from '$lib/server/stats'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.p_stats) {
    throw redirect(303, '/dashboard')
  }

  const range = event.url.searchParams.get('range') || '30d'

  const startDate = new Date()
  if (range === '1d') startDate.setDate(startDate.getDate() - 1)
  else if (range === '14d') startDate.setDate(startDate.getDate() - 14)
  else if (range === '30d') startDate.setDate(startDate.getDate() - 30)
  else if (range === '90d') startDate.setDate(startDate.getDate() - 91)
  else startDate.setDate(startDate.getDate() - 30)

  try {
    const [rawStats, profiles] = await Promise.all([
      db.stat
        .findMany({
          where: {
            createdAt: { gte: startDate }
          },
          select: {
            action: true,
            value: true,
            createdAt: true
          }
        })
        .catch((err) => {
          console.error('Failed to load stats:', err)
          throw new ServerError('Failed to load stats', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
        }),
      db.profile.findMany({ select: { isDefault: true, id: true, slug: true, name: true } }).catch((err) => {
        console.error('Failed to load profiles:', err)
        throw new ServerError('Failed to load profiles', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
      })
    ])
    const defaultProfile = profiles.find((p) => p.isDefault)!

    let totalStartups = 0
    let totalLaunches = 0

    const profileDistribution: Record<string, number> = {}
    const authTypes: Record<string, number> = {}
    const osArch: Record<string, Record<string, number>> = {}

    const versionsOverTime: Record<string, Record<string, number>> = {}
    const ramRawData: Record<string, { min: number[]; max: number[] }> = {}

    for (const stat of rawStats) {
      if (!stat.value) continue

      let parsed
      try {
        parsed = JSON.parse(stat.value)
      } catch {
        continue
      }

      const bucket = getBucketKey(stat.createdAt, startDate, range)

      switch (stat.action) {
        case 'STARTUP':
          totalStartups++

          if (parsed.current) {
            if (!versionsOverTime[bucket]) versionsOverTime[bucket] = {}
            versionsOverTime[bucket][parsed.current] = (versionsOverTime[bucket][parsed.current] || 0) + 1
          }
          break

        case 'LAUNCH':
          totalLaunches++

          const os = parsed.os || 'unknown'
          const arch = parsed.arch || 'unknown'
          if (!osArch[os]) osArch[os] = {}
          osArch[os][arch] = (osArch[os][arch] || 0) + 1

          if (parsed.profile) {
            profileDistribution[parsed.profile] = (profileDistribution[parsed.profile] || 0) + 1
          } else {
            profileDistribution[defaultProfile.slug] = (profileDistribution[defaultProfile.slug] || 0) + 1
          }

          if (parsed.minRam || parsed.maxRam) {
            if (!ramRawData[bucket]) ramRawData[bucket] = { min: [], max: [] }
            if (parsed.minRam) ramRawData[bucket].min.push(parsed.minRam)
            if (parsed.maxRam) ramRawData[bucket].max.push(parsed.maxRam)
          }
          break

        case 'LOGIN':
          if (parsed.type) {
            authTypes[parsed.type] = (authTypes[parsed.type] || 0) + 1
          }
          break
      }
    }

    const ramOverTime = Object.keys(ramRawData)
      .sort()
      .map((bucket) => {
        const minStats = getStats(ramRawData[bucket].min)
        const maxStats = getStats(ramRawData[bucket].max)
        return { date: bucket, min: minStats, max: maxStats }
      })

    const mappings: Record<string, string> = {
      '-': '-',
      win: 'Windows',
      mac: 'macOS',
      linux: 'Linux',
      crack: 'Cracked',
      microsoft: 'Microsoft',
      azauth: 'AzAuth',
      yggdrasil: 'Yggdrasil',
      ...Object.fromEntries(profiles.map((p) => [p.slug, p.name]))
    }

    const mostPopularProfile =
      Object.entries(profileDistribution).reduce((max, [profile, count]) => (count > max.count ? { profile, count } : max), {
        profile: '',
        count: 0
      }).profile || '-'

    const mostPopularProfileRate = totalLaunches > 0 ? (profileDistribution[mostPopularProfile] / totalLaunches) * 100 : 0
    const funnelConversionRate = totalStartups > 0 ? (totalLaunches / totalStartups) * 100 : 0

    const allVersions = Array.from(new Set(Object.values(versionsOverTime).flatMap((day) => Object.keys(day))))

    for (const os in osArch) {
      const humanReadableOs = mappings[os] || os
      osArch[humanReadableOs] = osArch[os]
      delete osArch[os]
    }
    for (const auth in authTypes) {
      const humanReadableAuth = mappings[auth] || auth
      authTypes[humanReadableAuth] = authTypes[auth]
      delete authTypes[auth]
    }
    for (const profile in profileDistribution) {
      const humanReadableProfile = mappings[profile] || profile
      profileDistribution[humanReadableProfile] = profileDistribution[profile]
      delete profileDistribution[profile]
    }

    return {
      range,
      kpis: {
        totalLaunches,
        funnelConversionRate,
        mostPopularProfile: mappings[mostPopularProfile] || mostPopularProfile,
        mostPopularProfileRate
      },
      charts: {
        dates: Object.keys(versionsOverTime).sort(),
        allVersions,
        versionsOverTime,
        osArch,
        profileDistribution,
        authTypes,
        ramOverTime
      }
    }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })
    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  reset: async (event) => {
    const user = event.locals.user

    if (user?.p_stats !== 2) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    try {
      await resetStats()
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}

function getStats(arr: number[]) {
  if (arr.length === 0) return { avg: 0, std: 0 }
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length
  const variance = arr.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / arr.length
  return { avg: Math.round(avg), std: Math.round(Math.sqrt(variance)) }
}

function getBucketKey(date: Date, startDate: Date, range: string) {
  const msDiff = date.getTime() - startDate.getTime()

  if (range === '1d') {
    return date.toISOString().substring(0, 13) + 'h'
  } else if (range === '14d') {
    return date.toISOString().substring(0, 10)
  } else if (range === '30d') {
    return date.toISOString().substring(0, 10)
    // 3-day buckets for 30 days range... maybe... let's keep it simple for now and just use daily buckets.
    // const block = Math.floor(msDiff / (3 * 24 * 60 * 60 * 1000))
    // const blockDate = new Date(startDate.getTime() + block * 3 * 24 * 60 * 60 * 1000)
    // return blockDate.toISOString().substring(0, 10)
  } else {
    const block = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000))
    const blockDate = new Date(startDate.getTime() + block * 7 * 24 * 60 * 60 * 1000)
    return blockDate.toISOString().substring(0, 10)
  }
}

