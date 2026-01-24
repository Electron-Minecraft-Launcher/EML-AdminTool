import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { LoaderVersion } from '$lib/utils/types'
import { db } from './db'
import { getOrSet } from './cache'
import { ILoaderFormat, ILoaderType, type Loader } from '$lib/utils/db'

export async function getLoader() {
  let loader
  try {
    loader = await db.loader.findFirst()
    return loader as Loader
  } catch (err) {
    console.error('Failed to load loader:', err)
    throw new ServerError('Failed to load loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getVanillaVersions() {
  return getOrSet('vanilla-versions', async () => {
    const response = await fetchJson('https://launchermeta.mojang.com/mc/game/version_manifest.json', 'Failed to fetch Minecraft versions')

    let versions = [
      { minecraftVersion: 'Latest', loaderVersion: 'latest_release', type: ['release'] },
      { minecraftVersion: 'Latest', loaderVersion: 'latest_snapshot', type: ['snapshot'] }
    ]

    let release = 'Latest'
    for (const version of response.versions) {
      if (version.id.startsWith('1.')) release = version.id.split('-')[0].split(' ')[0].split('.').slice(0, 2).join('.')
      if (release.startsWith('1.RV')) continue
      versions.push({
        minecraftVersion: release,
        loaderVersion: version.id,
        type: [version.type]
      })
    }

    return versions as LoaderVersion[]
  })
}

export async function getForgeVersions() {
  return getOrSet('forge-versions', async () => {
    const res1 = await fetchJson('https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json', 'Failed to fetch Forge versions')
    const res2 = await fetchJson(
      'https://files.minecraftforge.net/maven/net/minecraftforge/forge/promotions_slim.json',
      'Failed to fetch Forge promotions'
    )

    let versions: LoaderVersion[] = []
    for (const [version, data] of Object.entries(res1)) {
      versions.push(
        ...(data as any).map((v: any) => ({
          minecraftVersion: version.split('.').slice(0, 2).join('.'),
          loaderVersion: v,
          type: ['default' as const]
        }))
      )
    }

    for (const [version, data] of Object.entries(res2.promos)) {
      const minecraftVersion = version.split('-')[0]
      const type = version.split('-')[1] as 'recommended' | 'latest'
      const i = versions.findIndex((v) => v.loaderVersion.startsWith(`${minecraftVersion}-${data}`))
      if (i === -1) continue
      versions[i].type =
        (versions[i].type.includes('recommended') || versions[i].type.includes('latest')) && !versions[i].type.includes(type)
          ? ['latest', 'recommended']
          : [type]
    }

    versions = versions.reverse()

    return versions
  })
}

export async function getFabricVersions() {
  return getOrSet('fabric-versions', async () => {
    const gameVersions = await fetchJson('https://meta.fabricmc.net/v2/versions/game', 'Failed to fetch Fabric game versions')

    let versions: LoaderVersion[] = []
    let currentMajor = 'Snapshots'

    for (const gv of gameVersions) {
      const match = gv.version.match(/^1\.\d+/)

      if (match) {
        currentMajor = match[0]
      }

      versions.push({
        minecraftVersion: currentMajor,
        loaderVersion: `${gv.version}`,
        type: [gv.stable ? 'release' : 'snapshot']
      })
    }

    return versions
  })
}

export async function getFabricLoaderVersions() {
  const loaderVersions = await fetchJson('https://meta.fabricmc.net/v2/versions/loader', 'Failed to fetch Fabric loader versions')
  return loaderVersions.map((lv: any) => lv.version) as string[]
}

export async function checkVanillaLoader(minecraftVersion: string, loaderVersion: string) {
  if (loaderVersion !== minecraftVersion) {
    console.warn('Loader version and Minecraft version mismatch:', loaderVersion, minecraftVersion)
    throw new BusinessError('Loader version and Minecraft version mismatch', NotificationCode.FILESUPDATER_VERSIONS_MISMATCH, 400)
  }

  if (minecraftVersion !== 'latest_release' && minecraftVersion !== 'latest_snapshot') {
    const vanillaVersions = (await getVanillaVersions()) as any
    const exists = vanillaVersions.some((v: any) => v.loaderVersion === minecraftVersion)

    if (!exists) {
      console.warn('Invalid Minecraft version:', minecraftVersion)
      throw new BusinessError('Invalid Minecraft version', NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND, 400)
    }
  }
}

export async function checkForgeLoader(minecraftVersion: string, loaderVersion: string) {
  if (loaderVersion.split('-')[0].replace('_', '-') !== minecraftVersion) {
    console.warn('Loader version and Minecraft version mismatch:', loaderVersion, minecraftVersion)
    throw new BusinessError('Loader version and Minecraft version mismatch', NotificationCode.FILESUPDATER_VERSIONS_MISMATCH, 400)
  }

  const forgeVersions = await getForgeVersions()
  const exists = forgeVersions.some((v) => v.loaderVersion === loaderVersion)

  if (!exists) {
    console.warn('Invalid Forge version:', loaderVersion, minecraftVersion)
    throw new BusinessError('Invalid Forge version', NotificationCode.FILESUPDATER_FORGE_VERSION_NOT_FOUND, 400)
  }
}

export async function checkFabricLoader(minecraftVersion: string, loaderVersion: string) {
  const gameVersions = await fetchJson('https://meta.fabricmc.net/v2/versions/game', 'Failed to fetch Fabric game versions')
  const existsGameVersion = gameVersions.find((v: any) => v.version === minecraftVersion)

  if (!existsGameVersion) {
    console.warn('Invalid Minecraft version for Fabric:', minecraftVersion)
    throw new BusinessError('Invalid Minecraft version', NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND, 400)
  }

  const loaders = await fetchJson('https://meta.fabricmc.net/v2/versions/loader', 'Failed to fetch Fabric loader versions')
  const existsLoader = loaders.find((l: any) => l.version === loaderVersion)
  if (!existsLoader) {
    console.warn('Invalid Fabric loader version:', loaderVersion)
    throw new BusinessError('Invalid Fabric loader version', NotificationCode.FILESUPDATER_FABRIC_VERSION_NOT_FOUND, 400)
  }
}

export async function getForgeFile(loaderVersion: string) {
  const forgeMeta = (
    await fetchJson(`https://files.minecraftforge.net/net/minecraftforge/forge/${loaderVersion}/meta.json`, 'Failed to fetch Forge meta')
  ).classifiers

  const format = getFormat(forgeMeta)
  const ext = Object.keys(forgeMeta[format])[0]
  const url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${loaderVersion}/forge-${loaderVersion}-${format.toLowerCase()}.${ext}`

  return {
    format: getTypedFormat(format),
    file: {
      name: `forge-${loaderVersion}.jar`,
      path: `versions/forge-${loaderVersion}/`,
      url: url,
      size: await getRemoteFileSize(url, 'Failed to fetch Forge artifact size'),
      sha1: await getRemoteFileSha1(`${url}.sha1`, 'Failed to fetch Forge artifact SHA1'),
      type: 'OTHER' as const
    }
  }
}

export async function updateLoader(loader: Partial<Loader>) {
  let existingLoader
  try {
    existingLoader = await db.loader.findUnique({ where: { id: '1' } })
  } catch (err) {
    console.error('Failed to fetch existing loader:', err)
    throw new ServerError('Failed to fetch existing loader', err, NotificationCode.DATABASE_ERROR, 500)
  }

  const formattedLoader = {
    id: '1',
    type: loader.type ?? ILoaderType.VANILLA,
    minecraftVersion: loader.minecraftVersion ?? 'latest_release',
    loaderVersion: loader.loaderVersion ?? 'latest_release',
    format: loader.format ?? ILoaderFormat.UNIVERSAL,
    file: loader.file ?? (null as any)
  }

  try {
    if (existingLoader) {
      await db.loader.update({ where: { id: '1' }, data: formattedLoader })
    } else {
      await db.loader.create({ data: formattedLoader })
    }
  } catch (err) {
    console.error('Failed to update loader:', err)
    throw new ServerError('Failed to update loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

async function fetchJson(url: string, errorMsg: string) {
  try {
    const response = await fetch(url, { headers: { Connection: 'close' } })
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

async function getRemoteFileSize(url: string, errorMsg: string) {
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

async function getRemoteFileSha1(url: string, errorMsg: string) {
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
