import type { LoaderVersion } from '$lib/utils/types'
import { fetchJson } from './utils'

interface MetaConfig {
  name: string
  metaUrl: string
  v2?: boolean
}

export async function getFabricLikeVersions(config: MetaConfig) {
  const gameVersionsUrl = `${config.metaUrl}/${config.v2 ? 'v2' : 'v3'}/versions/game`
  const gameVersionsRaw = await fetchJson(gameVersionsUrl, `Failed to fetch ${config.name} game versions`)
  const supportedGameVersions = gameVersionsRaw.filter((v: any) => v.stable).map((v: any) => v.version)
  const loaderUrl = `${config.metaUrl}/${config.v2 ? 'v2' : 'v3'}/versions/loader`
  const loadersRaw = await fetchJson(loaderUrl, `Failed to fetch ${config.name} loader versions`)
  const versions: LoaderVersion[] = []
  const recentLoaders = loadersRaw.slice(0, 15)

  for (const gameVersion of supportedGameVersions) {
    for (const loader of recentLoaders) {
      versions.push({
        minecraftVersion: gameVersion,
        loaderVersion: loader.version,
        type: loader.stable ? ['release'] : ['snapshot']
      })
    }
  }

  return versions
}
