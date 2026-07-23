import { error, json, redirect, type Handle, type HandleServerError, type RequestEvent } from '@sveltejs/kit'
import { env as dynEnv } from '$env/dynamic/private'
import pkg from '../package.json'
import { db } from '$lib/server/db'
import type { LanguageCode } from '$lib/stores/language'
import { sweepPermissions, userPermissionsCache, verify } from '$lib/server/auth'
import { deleteSession, getBearerToken, verifyScopedToken } from '$lib/server/jwt'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { ProfileVisibility, type User } from '@prisma/client'
import { defaultPgURL } from '$lib/server/setup'
import path from 'node:path'
import fs from 'node:fs/promises'
import stream from 'node:stream'
import { createReadStream } from 'node:fs'
import mime from 'mime-types'
import { dev } from '$app/environment'
import { sequence } from '@sveltejs/kit/hooks'
import '$lib/utils/prototypes'
import { protectedProfilesCache } from '$lib/server/profile'

const DEFAULT_ORIGINS = ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173']
const filesDir = path.resolve(process.cwd(), 'files')
await initProtectedProfiles()

const app: Handle = async ({ event, resolve }) => {
  const securityResponse = await handleSecurityBlocking(event)
  if (securityResponse) return securityResponse

  if (event.url.pathname.startsWith('/files/')) {
    return await serveStaticFile(event.url.pathname)
  }

  if (event.url.pathname !== '/api/ping') {
    await loadApplicationContext(event)
  }

  const response = await resolve(event)

  return injectCorsHeaders(response, event)
}

const logger: Handle = async ({ event, resolve }) => {
  const user = event.locals.user
  const ip = event.getClientAddress()
  const date = new Date().formatDateLogs()
  const start = performance.now()
  const method = event.request.method
  const host = event.request.headers.get('host') ?? 'unknown'
  const url = event.url.pathname

  const response = await resolve(event)

  const end = performance.now()
  const duration = (end - start).toFixed(2)

  const kitStatus = response.headers.get('x-sveltekit-status')
  const status = event.locals.logStatus ?? (kitStatus ? Number.parseInt(kitStatus) : response.status)

  if (!url.startsWith('/_app') && !url.startsWith('/favicon.ico')) {
    let username = ''
    if (user?.username) {
      username = ` ${user.username}`
    }

    let color = '\x1b[32m' // green
    if (status >= 300) color = '\x1b[33m' // yellow
    if (status >= 400) color = '\x1b[31m' // red
    const reset = '\x1b[0m'

    console.log(`[${date}] ${host} - [${ip}${username}] ${method} ${url} ${color}${status}${reset} (${duration}ms)`)
  }

  return response
}

export const handleError: HandleServerError = ({ error, status, message }) => {
  if (status >= 404) {
    return {
      message: 'Not Found',
      code: NotificationCode.NOT_FOUND
    }
  }

  console.error('*** SERVER ERROR ***')
  console.error(error)

  return {
    message: message ?? 'Internal Server Error',
    code: NotificationCode.INTERNAL_SERVER_ERROR
  }
}

export const handle: Handle = sequence(app, logger)

function getAllowedOrigins() {
  const envValue = process.env.ALLOWED_ORIGINS

  if (!envValue) {
    const defaults = [...DEFAULT_ORIGINS]
    if (dynEnv.ORIGIN) defaults.push(dynEnv.ORIGIN)
    return defaults
  }

  const allowed = envValue.split(',').map((o) => o.trim())
  if (dynEnv.ORIGIN) allowed.push(dynEnv.ORIGIN)

  return allowed.filter(Boolean)
}

async function handleSecurityBlocking(event: RequestEvent) {
  const user = event.locals.user
  const requestOrigin = event.request.headers.get('origin')
  const method = event.request.method
  const allowedOrigins = getAllowedOrigins()
  const pathname = event.url.pathname

  if (method === 'OPTIONS') {
    if (dev) return null
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Origin': requestOrigin,
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      })
    }
    return new Response(null)
  }

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
      if (dev) return null
      console.error(`CSRF Blocked: ${requestOrigin} is not allowed.`)
      console.error(`Allowed origins: ${allowedOrigins.join(', ')}`)
      return json(
        { success: false, message: 'Forbidden: Invalid origin' },
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  if (pathname.startsWith('/files/')) {
    const parts = pathname.split('/')
    if (parts.length >= 4) {
      const slug = parts[3]

      if (protectedProfilesCache.has(slug)) {
        const token = getBearerToken(event.request)
        const session = event.cookies.get('session')

        if (token && (await verifyScopedToken(token, 'profile', { slug }))) {
          return null
        }

        if (session) {
          try {
            const user = await verify(session)
            await ensureUserPermissionsLoaded(user.id)
            const cache = userPermissionsCache.get(user.id)
            if (user.isAdmin || cache?.permissions.has(slug)) {
              return null
            }
          } catch {}
        }
        return json({ success: false, message: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  return null
}

function injectCorsHeaders(response: Response, event: RequestEvent): Response {
  if (dev) {
    const requestOrigin = event.request.headers.get('origin')
    if (requestOrigin) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return response
  }

  const requestOrigin = event.request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

async function serveStaticFile(pathname: string) {
  let relativePath = pathname.substring('/files/'.length)

  try {
    relativePath = decodeURIComponent(relativePath)
  } catch {
    return json({ success: false, message: 'Malformed URL' }, { status: 400 })
  }

  const resolvedPath = path.resolve(path.join(filesDir, relativePath))

  if (!resolvedPath.startsWith(filesDir)) {
    return json({ success: false, message: 'Forbidden' }, { status: 403 })
  }

  try {
    const fileStats = await fs.stat(resolvedPath)

    if (!fileStats.isFile()) {
      return json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const extension = path.extname(resolvedPath).toLowerCase()
    const fileName = path.basename(resolvedPath)
    let mimeType: string

    if (['.ts', '.js', '.jsx', '.tsx', '.svelte', '.vue', '.css', '.html'].includes(extension)) {
      mimeType = 'text/plain; charset=utf-8'
    } else {
      mimeType = mime.lookup(resolvedPath) || 'application/octet-stream'
    }

    const nodeStream = createReadStream(resolvedPath)
    const webStream = stream.Readable.toWeb(nodeStream)

    return new Response(webStream as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileStats.size.toString(),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-transform',
        'Content-Disposition': `inline; filename="${fileName}"`
      }
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      return json({ success: false, message: 'File not found' }, { status: 404 })
    } else {
      console.error('Error serving file:', err)
      return json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    }
  }
}

async function loadApplicationContext(event: RequestEvent) {
  event.locals.isConfigured = checkIsConfigured()

  if (!event.locals.isConfigured) {
    event.locals.env = getDefaultEnv()
    return
  }

  try {
    const envData = await db.environment.findFirst()
    event.locals.env = {
      language: (envData?.language as LanguageCode) ?? 'en',
      name: envData?.name ?? 'EML',
      theme: envData?.theme ?? 'default',
      version: pkg.version
    }
  } catch (err) {
    console.error('Failed to load environment:', err)
    event.locals.env = getDefaultEnv()
  }

  const session = event.cookies.get('session')
  if (session) {
    await handleUserSession(event, session)
  }
}

async function handleUserSession(event: RequestEvent, session: string) {
  try {
    const user = await verify(session)
    event.locals.user = getUserInfo(user, user.profilePermissions)

    sweepPermissions()
  } catch (err) {
    deleteSession(event)

    if (err instanceof BusinessError) throw redirect(302, '/login')
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown session error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}

function checkIsConfigured() {
  return process.env.IS_CONFIGURED === 'true' && process.env.DATABASE_URL !== defaultPgURL && process.env.DATABASE_URL !== undefined
}

function getDefaultEnv() {
  return {
    language: 'en' as LanguageCode,
    name: 'EML',
    theme: 'default',
    version: pkg.version
  }
}

function getUserInfo(user: User, profilePermissions: { profileId: string; name: string; slug: string; permission: number }[] = []) {
  return {
    id: user.id,
    username: user.username,
    p_filesUpdater: user.p_filesUpdater as 0 | 1 | 2,
    p_bootstraps: user.p_bootstraps as 0 | 1,
    p_maintenance: user.p_maintenance as 0 | 1 | 2,
    p_news: user.p_news as 0 | 1 | 2,
    p_newsCategories: user.p_newsCategories as 0 | 1,
    p_newsTags: user.p_newsTags as 0 | 1,
    p_backgrounds: user.p_backgrounds as 0 | 1,
    p_stats: user.p_stats as 0 | 1 | 2,
    p_crashReports: user.p_crashReports as 0 | 1 | 2,
    isAdmin: user.isAdmin,
    profilePermissions: profilePermissions as { profileId: string; name: string; slug: string; permission: 0 | 1 | 2 }[]
  }
}

async function initProtectedProfiles() {
  try {
    const profiles = await db.profile.findMany({
      where: { visibility: ProfileVisibility.PROTECTED },
      select: { slug: true }
    })

    protectedProfilesCache.clear()
    profiles.forEach((profile) => {
      protectedProfilesCache.add(profile.slug)
    })
  } catch (err) {
    console.error('Unknown database error:', err)
    throw error(500, { message: NotificationCode.DATABASE_ERROR })
  }
}

async function ensureUserPermissionsLoaded(userId: string) {
  if (userPermissionsCache.has(userId)) return

  const permissions = await db.userProfilePermission.findMany({
    where: { userId },
    select: { profileId: true, permission: true }
  })

  const allowedProfiles = new Set(permissions.filter((p) => p.permission > 0).map((p) => p.profileId))
  userPermissionsCache.set(userId, {
    permissions: allowedProfiles,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  })
}
