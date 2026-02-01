import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser()

export async function fetchJson(url: string, errorMsg: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`${errorMsg}:`, response.statusText)
      throw new ServerError(errorMsg, null, NotificationCode.EXTERNAL_API_ERROR, response.status)
    }
    return await response.json()
  } catch (err) {
    console.error(`${errorMsg}:`, err)
    throw new ServerError(errorMsg, err, NotificationCode.EXTERNAL_API_ERROR, 500)
  }
}

export async function fetchXml(url: string, errorMsg: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`${errorMsg}:`, response.statusText)
      throw new ServerError(errorMsg, null, NotificationCode.EXTERNAL_API_ERROR, response.status)
    }
    const text = await response.text()
    return parser.parse(text)
  } catch (err) {
    console.error(`${errorMsg}:`, err)
    throw new ServerError(errorMsg, err, NotificationCode.EXTERNAL_API_ERROR, 500)
  }
}

export async function getRemoteFileSize(url: string, errorMsg: string) {
  try {
    const response = await fetch(url, { method: 'HEAD', headers: { Connection: 'close' } })
    if (!response.ok) {
      console.error(`${errorMsg}:`, response.statusText)
      throw new ServerError(errorMsg, null, NotificationCode.EXTERNAL_API_ERROR, response.status)
    }
    return Number(response.headers.get('Content-Length') ?? 0)
  } catch (err) {
    console.error(`${errorMsg}:`, err)
    throw new ServerError(errorMsg, err, NotificationCode.EXTERNAL_API_ERROR, 500)
  }
}

export async function getRemoteFileSha1(url: string, errorMsg: string) {
  try {
    const response = await fetch(url, { headers: { Connection: 'close' } })
    if (!response.ok) {
      console.error(`${errorMsg}:`, response.statusText)
      throw new ServerError(errorMsg, null, NotificationCode.EXTERNAL_API_ERROR, response.status)
    }
    return await response.text().then((text) => text.trim())
  } catch (err) {
    console.error(`${errorMsg}:`, err)
    throw new ServerError(errorMsg, err, NotificationCode.EXTERNAL_API_ERROR, 500)
  }
}

export function getMajorVersion(version: string, fallback = 'Latest') {
  const match = version.match(/^(1\.\d+)|^(\d+\.)/)
  let majorVersion = ''
  if (match) majorVersion = match[0].replace(/\.$/, '')
  if (majorVersion == '0') majorVersion = 'Classic'
  return majorVersion || fallback
}
