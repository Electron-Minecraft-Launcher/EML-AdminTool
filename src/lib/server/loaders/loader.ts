import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type { LoaderVersion } from '$lib/utils/types'
import { db } from '../db'
import { getOrSet } from '../cache'
import { ILoaderFormat, ILoaderType, type Loader } from '$lib/utils/db'
import { fetchJson } from './utils'
import { getFabricLikeVersions } from './fabric-like'
import { getForgeLikeVersions } from './forge-like'

export async function getLoader() {
  try {
    const loader = await db.loader.findFirst()
    return loader as Loader
  } catch (err) {
    console.error('Failed to load loader:', err)
    throw new ServerError('Failed to load loader', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getVanillaVersions() {
  return getOrSet('vanilla-versions', async () => {
      const response = await fetchJson('https://launchermeta.mojang.com/mc/game/version_manifest.json', 'Failed to fetch Minecraft versions')
  
      let versions: LoaderVersion[] = [
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
  
      return versions
    })
}

export async function getForgeVersions() {
  return getOrSet('forge-versions', async () => {
    return await getForgeLikeVersions({
      name: 'Forge',
      mavenUrl: 'https://maven.minecraftforge.net/',
      group: 'net/minecraftforge/forge',
      promotionsUrl: 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json'
    })
  })
}

export async function getNeoForgeVersions() {
  return getOrSet('neoforge-versions', async () => {
    return await getForgeLikeVersions({
      name: 'NeoForge',
      mavenUrl: 'https://maven.neoforged.net/releases/',
      group: 'net/neoforged/neoforge'
    })
  })
}

export async function getFabricVersions() {
  return getOrSet('fabric-versions', async () => {
    return await getFabricLikeVersions({
      name: 'Fabric',
      metaUrl: 'https://meta.fabricmc.net',
      v2: true
    })
  })
}

export async function getQuiltVersions() {
  return getOrSet('quilt-versions', async () => {
    return await getFabricLikeVersions({
      name: 'Quilt',
      metaUrl: 'https://meta.quiltmc.org',
      v2: false
    })
  })
}

// --- Checkers (Validation) ---
//* Note: Il faudra créer checkNeoForgeLoader et checkQuiltLoader sur le même modèle que les existants

export function checkVanillaLoader(mc: string, loader: string) {
  if (mc !== loader) throw new BusinessError('Invalid Vanilla loader version', NotificationCode.INVALID_INPUT, 400)
}

export function checkFabricLikeLoader(mc: string, loader: string) {
  if (!loader) throw new BusinessError('Invalid Loader version', NotificationCode.MISSING_INPUT, 400)
}

export function checkForgeLikeLoader(mc: string, loader: string) {
  if (!loader) throw new BusinessError('Invalid Loader version', NotificationCode.MISSING_INPUT, 400)
}

// --- Update ---

export async function updateLoader(loader: any) {
  // ... (Ton code existant pour updateLoader reste valide, assure-toi juste de gérer les types NEOFORGE et QUILT dans ton switch/case si tu as une logique spécifique)
  // Pour l'instant, l'update DB est générique.
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


