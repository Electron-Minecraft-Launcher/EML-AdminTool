import { BusinessError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { LoaderVersion } from '$lib/utils/types'
import { getOrSet } from '../cache'
import { fetchJson, getMajorVersion } from './utils'

const VANILLA_VERSION_MANIFEST_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json'

export async function getVanillaVersions() {
  return getOrSet('vanilla-versions', async () => {
    const response = await fetchJson(VANILLA_VERSION_MANIFEST_URL, 'Failed to fetch Minecraft versions')

    let versions: LoaderVersion[] = [
      { majorVersion: 'Latest', minecraftVersion: 'latest_release', loaderVersion: 'latest_release', type: ['release'] },
      { majorVersion: 'Latest', minecraftVersion: 'latest_release', loaderVersion: 'latest_snapshot', type: ['snapshot'] }
    ]

    let majorVersion = 'Latest' // out of the loop to handle snapshots properly
    for (const version of response.versions) {
      if (version.id.includes('RV') || version.id.includes('3D')) continue

      majorVersion = getMajorVersion(version.id, majorVersion)
      const type = version.type.startsWith('old_') ? 'snapshot' : version.type
      versions.push({
        majorVersion: majorVersion,
        minecraftVersion: version.id,
        loaderVersion: version.id,
        type: type
      })
    }

    return versions
  })
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
