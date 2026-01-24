import type { LoaderVersion } from '$lib/utils/types'
import { fetchJson, fetchXml } from './utils'

interface MavenConfig {
  name: string
  mavenUrl: string
  group: string
  promotionsUrl?: string
}

export async function getForgeLikeVersions(config: MavenConfig) {
  const metadataUrl = `${config.mavenUrl}${config.group}/maven-metadata.xml`
  const metadata = await fetchXml(metadataUrl, `Failed to fetch ${config.name} metadata`)

  const allVersions = metadata.metadata.versioning.versions.version as string[]
  allVersions.reverse()

  const versions: LoaderVersion[] = []

  let promos: Record<string, string> = {}

  if (config.promotionsUrl) {
    try {
      const promoData = await fetchJson(config.promotionsUrl, `Failed to fetch ${config.name} promotions`)
      promos = promoData.promos || {}
    } catch (e) {
      console.warn('Could not fetch promotions, skipping marks.')
    }
  }

  for (const v of allVersions) {
    let mcVersion = ''
    let loaderVer = v
    let type: LoaderVersion['type'] = ['release']

    if (config.name === 'NeoForge') {
      if (v.includes('-')) {
        const parts = v.split('-')
        mcVersion = parts[0]
      } else {
        const major = parseInt(v.split('.')[0])
        if (!isNaN(major)) {
          if (major >= 20) mcVersion = `1.${major}`
        }
      }
    } else {
      const parts = v.split('-')
      if (parts.length >= 2) {
        mcVersion = parts[0]
      }
    }

    if (!mcVersion) continue

    if (promos[`${mcVersion}-latest`] === v) type.push('latest')
    if (promos[`${mcVersion}-recommended`] === v) type.push('recommended')

    versions.push({
      minecraftVersion: mcVersion,
      loaderVersion: loaderVer,
      type
    })
  }

  return versions
}
