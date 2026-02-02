import { error, redirect, type Handle, type HandleServerError, type RequestEvent } from '@sveltejs/kit'
import { env as dynEnv } from '$env/dynamic/private'
import pkg from '../package.json'
import { db } from '$lib/server/db'
import type { LanguageCode } from '$lib/stores/language'
import { verify } from '$lib/server/auth'
import { deleteSession } from '$lib/server/jwt'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { type User } from '$lib/utils/db'
import { defaultPgURL } from '$lib/server/setup'
import path from 'node:path'
import fs from 'node:fs'
import mime from 'mime-types'
import { dev } from '$app/environment'
import { sequence } from '@sveltejs/kit/hooks'
import '$lib/utils/prototypes'

const DEFAULT_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173'
]

const filesDir = path.resolve(process.cwd(), 'files')

const app: Handle = async ({ event, resolve }) => {
  const securityResponse = handleSecurityBlocking(event)
  if (securityResponse) return securityResponse

  if (event.url.pathname.startsWith('/files/')) {
    return serveStaticFile(event.url.pathname)
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

    let color = '\x1b[32m' // Green
    if (status >= 300) color = '\x1b[33m' // Yellow
    if (status >= 400) color = '\x1b[31m' // Red
    const reset = '\x1b[0m'

    console.log(`[${date}] ${host} - [${ip}${username}] ${method} ${url} ${color}${status}${reset} (${duration}ms)`)
  }

  return response
}

export const handleError: HandleServerError = ({ error, event, status, message }) => {
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

export const handle = sequence(app, logger)

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

function handleSecurityBlocking(event: RequestEvent) {
  if (dev) return null

  const requestOrigin = event.request.headers.get('origin')
  const method = event.request.method
  const allowedOrigins = getAllowedOrigins()

  if (method === 'OPTIONS') {
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
      console.error(`CSRF Blocked: ${requestOrigin} is not allowed.`)
      console.error(`Allowed origins: ${allowedOrigins.join(', ')}`)
      return new Response(JSON.stringify({ message: 'Forbidden: Invalid origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
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

function serveStaticFile(pathname: string) {
  let relativePath = pathname.substring('/files/'.length)

  try {
    relativePath = decodeURIComponent(relativePath)
  } catch (e) {
    return new Response('Malformed URL', { status: 400 })
  }

  const resolvedPath = path.resolve(path.join(filesDir, relativePath))

  if (!resolvedPath.startsWith(filesDir)) {
    return new Response('Forbidden', { status: 403 })
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    const extension = path.extname(resolvedPath).toLowerCase()
    let mimeType: string

    if (['.ts', '.js', '.jsx', '.tsx', '.svelte', '.vue', '.css', '.html'].includes(extension)) {
      mimeType = 'text/plain; charset=utf-8'
    } else {
      mimeType = mime.lookup(resolvedPath) || 'application/octet-stream'
    }

    const fileContent = fs.readFileSync(resolvedPath)
    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  return new Response('File not found', { status: 404 })
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
    event.locals.user = getUserInfo(user)
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

function getUserInfo(user: User) {
  return {
    id: user.id,
    username: user.username,
    p_filesUpdater: user.p_filesUpdater as 0 | 1,
    p_bootstraps: user.p_bootstraps as 0 | 1,
    p_maintenance: user.p_maintenance as 0 | 1,
    p_news: user.p_news as 0 | 1 | 2,
    p_newsCategories: user.p_newsCategories as 0 | 1,
    p_newsTags: user.p_newsTags as 0 | 1,
    p_backgrounds: user.p_backgrounds as 0 | 1,
    p_stats: user.p_stats as 0 | 1 | 2,
    isAdmin: user.isAdmin
  }
}





