import { ILoaderType } from '$lib/utils/db'
import { BusinessError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { LoaderVersion } from '$lib/utils/types'
import { getOrSet } from '../cache'
import { fetchJson, getMajorVersion } from './utils'

type FabricLikeLoader = typeof ILoaderType.FABRIC | typeof ILoaderType.QUILT

const V = {
  [ILoaderType.FABRIC]: {
    name: 'Fabric',
    metaUrl: 'https://meta.fabricmc.net',
    v2: true
  },
  [ILoaderType.QUILT]: {
    name: 'Quilt',
    metaUrl: 'https://meta.quiltmc.org',
    v2: false
  }
}

export async function getFabricLikeGameVersions(loader: FabricLikeLoader) {
  const cacheKey = loader === ILoaderType.FABRIC ? 'fabric-game-versions' : 'quilt-game-versions'

  return getOrSet(cacheKey, async () => {
    const v = V[loader]
    const gameVersionsUrl = `${v.metaUrl}/${v.v2 ? 'v2' : 'v3'}/versions/game`
    const rawGameVersions: {version: string, stable: boolean}[] = await fetchJson(gameVersionsUrl, `Failed to fetch ${v.name} game versions`)

    const gameVersions: LoaderVersion[] = []

    let majorVersion = 'Latest' // out of the loop to handle snapshots properly
    for (const gv of rawGameVersions) {
      if (gv.version.includes('3D')) continue
      majorVersion = getMajorVersion(gv.version, majorVersion)

      gameVersions.push({
        majorVersion: majorVersion,
        minecraftVersion: gv.version,
        loaderVersion: gv.version,
        type: [gv.stable ? 'release' : 'snapshot']
      })
    }

    return gameVersions
  })
}

export async function getFabricLikeLoaderVersions(loader: FabricLikeLoader) {
  const cacheKey = loader === ILoaderType.FABRIC ? 'fabric-loader-versions' : 'quilt-loader-versions'

  return getOrSet(cacheKey, async () => {
    const v = V[loader]
    const loaderVersionsUrl = `${v.metaUrl}/${v.v2 ? 'v2' : 'v3'}/versions/loader`
    const rawLoaderVersions = await fetchJson(loaderVersionsUrl, `Failed to fetch ${v.name} loader versions`)
    const loaderVersions: string[] = rawLoaderVersions.map((lv: any) => lv.version)

    return loaderVersions
  })
}

export async function checkFabricLikeLoader(loader: FabricLikeLoader, minecraftVersion: string, loaderVersion: string) {
  const gameVersions = await getFabricLikeGameVersions(loader)
  const existsGame = gameVersions.find((gv) => gv.minecraftVersion === minecraftVersion)
  if (!existsGame) {
    console.warn(`Invalid ${V[loader].name} game version:`, minecraftVersion)
    throw new BusinessError(`Invalid ${V[loader].name} game version`, NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND, 400)
  }

  const loaderVersions = await getFabricLikeLoaderVersions(loader)
  const existsLoader = loaderVersions.find((lv) => lv === loaderVersion)
  if (!existsLoader) {
    console.warn(`Invalid ${V[loader].name} loader version:`, loaderVersion)
    throw new BusinessError(`Invalid ${V[loader].name} loader version`, NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND, 400)
  }
}
