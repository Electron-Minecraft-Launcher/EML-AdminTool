import { BusinessError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { LoaderVersion } from '$lib/utils/types'
import { getOrSet } from '../cache'
import { ILoaderFormat, ILoaderType } from '$lib/utils/db'
import { fetchJson, fetchXml, getMajorVersion, getRemoteFileSha1, getRemoteFileSize } from './utils'

type ForgeLikeLoader = typeof ILoaderType.FORGE | typeof ILoaderType.NEOFORGE

const V = {
  [ILoaderType.FORGE]: {
    name: 'Forge',
    mavenUrl: 'https://maven.minecraftforge.net',
    group: 'net.minecraftforge',
    artifact: 'forge',
    promotionsUrl: 'https://files.minecraftforge.net/maven/net/minecraftforge/forge/promotions_slim.json'
  },
  [ILoaderType.NEOFORGE]: {
    name: 'NeoForge',
    mavenUrl: 'https://maven.neoforged.net/releases',
    group: 'net.neoforged',
    artifact: 'neoforge',
    promotionsUrl: null
  }
}

export async function getForgeLikeVersions(loader: ForgeLikeLoader) {
  const cacheKey = loader === ILoaderType.FORGE ? 'forge-versions' : 'neoforge-versions'

  return getOrSet(cacheKey, async () => {
    const v = V[loader]
    const mavenMetadataUrl = `${v.mavenUrl}/${v.group.replace(/\./g, '/')}/${v.artifact}/maven-metadata.xml`
    const metadata = await fetchXml(mavenMetadataUrl, `Failed to fetch ${v.name} versions`)
    const rawVersions: string[] = metadata.metadata.versioning.versions.version
    const promos: Record<string, string> | null = v.promotionsUrl
      ? (await fetchJson(v.promotionsUrl, `Failed to fetch ${v.name} promotions`)).promos
      : null

    const versions: LoaderVersion[] = []

    let majorVersion = 'Latest' // out of the loop to handle snapshots properly
    for (const version of rawVersions) {
      let minecraftVersion = ''
      let loaderVersion = version
      let forgeVersion = ''
      let type: LoaderVersion['type'] = ['default']

      if (v.name === 'Forge') {
        const parsed = parseForgeVersion(version, majorVersion)
        if (parsed) {
          minecraftVersion = parsed.minecraftVersion
          majorVersion = parsed.majorVersion
          forgeVersion = parsed.forgeVersion
        } else {
          continue
        }
      } else if (v.name === 'NeoForge') {
        const parsed = parseNeoForgeVersion(version, majorVersion)
        if (parsed) {
          minecraftVersion = parsed.minecraftVersion
          majorVersion = parsed.majorVersion
        } else {
          continue
        }
      }

      if (promos && promos[`${minecraftVersion}-recommended`] === forgeVersion) type.push('recommended')
      if (promos && promos[`${minecraftVersion}-latest`] === forgeVersion) type.push('latest')

      if (loaderVersion.toLowerCase().includes('beta')) type = ['beta']
      if (loaderVersion.toLowerCase().includes('alpha')) type = ['alpha']

      versions.push({ majorVersion, minecraftVersion, loaderVersion, type })
    }

    return versions.sort((a, b) => {
      const mcDiff = b.minecraftVersion.localeCompare(a.minecraftVersion, undefined, { numeric: true })
      if (mcDiff !== 0) return mcDiff
      return b.loaderVersion.localeCompare(a.loaderVersion, undefined, { numeric: true })
    })
  })
}

export async function checkForgeLikeLoader(loader: ForgeLikeLoader, minecraftVersion: string, loaderVersion: string) {
  const versions = await getForgeLikeVersions(loader)
  const exists = versions.some((v) => v.minecraftVersion === minecraftVersion && v.loaderVersion === loaderVersion)

  if (!exists) {
    console.warn(`Invalid ${V[loader].name} loader version:`, minecraftVersion, loaderVersion)
    throw new BusinessError(`Invalid ${V[loader].name} version`, NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND, 400)
  }
}

export async function getForgeLikeFile(loader: typeof ILoaderType.FORGE | typeof ILoaderType.NEOFORGE, loaderVersion: string) {
  const v = V[loader]
  let format = 'installer'
  let ext = 'jar'

  if (loader === ILoaderType.FORGE) {
    const metaUrl = `https://files.minecraftforge.net/net/minecraftforge/forge/${loaderVersion}/meta.json`
    const meta = (await fetchJson(metaUrl, 'Failed to fetch Forge meta')).classifiers
    format = getFormat(meta)
    ext = Object.keys(meta[format])[0]
  }

  const url = `${v.mavenUrl}/${v.group.replace(/\./g, '/')}/${v.artifact}/${loaderVersion}/${v.artifact}-${loaderVersion}-${format.toLowerCase()}.${ext}`
  const name = `${v.artifact}-${loaderVersion}.${ext}`
  const path = `versions/${v.artifact}-${loaderVersion}/`
  const size = await getRemoteFileSize(url, 'Failed to fetch Forge artifact size')
  const sha1 = await getRemoteFileSha1(`${url}.sha1`, 'Failed to fetch Forge artifact SHA1')
  const type = 'OTHER' as const

  return {
    format: getTypedFormat(format),
    file: { name, path, url, size, sha1, type }
  }
}

function parseForgeVersion(v: string, currentMajor: string) {
  const parts = v.split('-')
  if (parts.length >= 2 && parts[0].startsWith('1.')) {
    const mcVer = parts[0]

    return {
      majorVersion: getMajorVersion(mcVer, currentMajor),
      minecraftVersion: mcVer,
      forgeVersion: parts[1]
    }
  }

  return null
}

function parseNeoForgeVersion(v: string, currentMajor: string) {
  try {
    if (/^\d{2,}\./.test(v) && !v.startsWith('1.')) {
      const cleanVer = v.split(/[-+]/)[0]
      const parts = cleanVer.split('.')

      const major = parseInt(parts[0])
      const minor = parseInt(parts[1]) || 0
      const patch = parseInt(parts[2]) || 0

      if (isNaN(major)) return null

      if (major >= 26) {
        let mcVer = `${major}.${minor}`
        if (patch > 0) mcVer += `.${patch}`

        const snapMatch = v.match(/snapshot[-.]?(\w+)/i)
        if (snapMatch) {
          mcVer += `-snapshot-${snapMatch[1]}`
        }

        return {
          majorVersion: getMajorVersion(mcVer, currentMajor),
          minecraftVersion: mcVer
        }
      }

      const mcVer = `1.${major}.${minor}`
      return {
        minecraftVersion: mcVer,
        majorVersion: getMajorVersion(mcVer, currentMajor)
      }
    }

    return null
  } catch {
    return null
  }
}

function getFormat(forgeMeta: any) {
  if (forgeMeta.installer) return 'installer'
  else if (forgeMeta.client) return 'client'
  return 'universal'
}

function getTypedFormat(format: string) {
  switch (format) {
    case 'installer':
      return ILoaderFormat.INSTALLER
    case 'client':
      return ILoaderFormat.CLIENT
    default:
      return ILoaderFormat.UNIVERSAL
  }
}
