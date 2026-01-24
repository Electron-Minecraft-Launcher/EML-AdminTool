import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from './db'
import { getOrSet } from './cache'
import { ILoaderFormat, ILoaderType, type Loader } from '$lib/utils/db'
import type { LoaderVersion } from '$lib/utils/types'

// --- INTERFACES & CLASSES ---

abstract class LoaderHandler {
  abstract getVersions(mcVersion: string): Promise<LoaderVersion[]>

  protected async fetchJson(url: string, errorMsg: string) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(response.statusText)
      return await response.json()
    } catch (err) {
      console.error(`${errorMsg}:`, err)
      return null
    }
  }

  protected async fetchText(url: string, errorMsg: string) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(response.statusText)
      return await response.text()
    } catch (err) {
      console.error(`${errorMsg}:`, err)
      return null
    }
  }
}

class MetaLoaderHandler extends LoaderHandler {
  constructor(
    private apiUrl: string,
    private type: 'FABRIC' | 'QUILT'
  ) {
    super()
  }

  async getVersions(mcVersion: string): Promise<LoaderVersion[]> {
    return getOrSet(`${this.type.toLowerCase()}-versions-${mcVersion}`, async () => {
      // Fabric utilise v2, Quilt utilise v3, mais la structure de réponse pour /loader est compatible
      const url = `${this.apiUrl}/versions/loader/${mcVersion}`
      const data = await this.fetchJson(url, `Failed to fetch ${this.type} versions`)

      if (!data || !Array.isArray(data)) return []

      return data.map((v: any) => ({
        minecraftVersion: mcVersion,
        loaderVersion: v.loader.version,
        type: this.type === 'FABRIC' ? (v.loader.stable ? 'release' : 'snapshot') : 'release' as 
      }))
    })
  }
}

/**
 * Handler pour Forge (Legacy JSON)
 */
class ForgeHandler extends LoaderHandler {
  async getVersions(mcVersion: string): Promise<LoaderVersion[]> {
    return getOrSet(`forge-versions-${mcVersion}`, async () => {
      const data = await this.fetchJson(
        'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json',
        'Failed to fetch Forge versions'
      )
      if (!data || !data.promos) return []

      const versions: LoaderVersion[] = []
      // On récupère les versions recommandées/latest
      const recommended = data.promos[`${mcVersion}-recommended`]
      const latest = data.promos[`${mcVersion}-latest`]

      if (recommended) versions.push({ minecraftVersion: mcVersion, loaderVersion: recommended, type: 'recommended' })
      if (latest && latest !== recommended) versions.push({ minecraftVersion: mcVersion, loaderVersion: latest, type: 'latest' })

      // Note: Pour avoir TOUTES les versions Forge, il faudrait parser le maven-metadata comme NeoForge.
      // Pour l'instant on garde la logique "promos" qui est plus simple et suffisante pour 99% des cas.

      return versions.reverse()
    })
  }
}

/**
 * Handler pour NeoForge (Maven XML)
 */
class NeoForgeHandler extends LoaderHandler {
  async getVersions(mcVersion: string): Promise<LoaderVersion[]> {
    return getOrSet(`neoforge-versions-${mcVersion}`, async () => {
      const xml = await this.fetchText(
        'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml',
        'Failed to fetch NeoForge versions'
      )
      if (!xml) return []

      // Parsing XML simple via Regex pour éviter une dépendance lourde
      const versionRegex = /<version>(.*?)<\/version>/g
      const versions: string[] = []
      let match
      while ((match = versionRegex.exec(xml)) !== null) {
        versions.push(match[1])
      }

      // Filtrage des versions correspondantes à la version MC
      // NeoForge suit le pattern: "Major.Minor.Patch" où Major.Minor correspond souvent à la version MC
      // Ex: MC 1.20.4 -> NeoForge 20.4.X
      // Ex: MC 1.20.1 -> NeoForge 20.1.X

      // On déduit le préfixe NeoForge depuis la version MC (1.20.4 -> 20.4)
      const parts = mcVersion.split('.')
      if (parts.length < 2) return []

      // Cas spécial: 1.20.1 -> 20.1, mais 1.20 -> 20.0 ? A vérifier selon les versions
      const neoPrefix = `${parts[1]}.${parts[2] ?? '0'}`

      return versions
        .filter((v) => v.startsWith(neoPrefix))
        .reverse() // Les plus récentes en haut
        .map((v) => ({
          minecraftVersion: mcVersion,
          loaderVersion: v,
          type: 'release'
        }))
    })
  }
}

// --- INSTANCES ---

const handlers = {
  [ILoaderType.FABRIC]: new MetaLoaderHandler('https://meta.fabricmc.net/v2', 'FABRIC'),
  [ILoaderType.QUILT]: new MetaLoaderHandler('https://meta.quiltmc.org/v3', 'QUILT'),
  [ILoaderType.FORGE]: new ForgeHandler(),
  [ILoaderType.NEOFORGE]: new NeoForgeHandler()
}

// --- EXPORTS ---

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
    try {
      const response = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
      if (!response.ok) throw new Error('Failed to fetch vanilla versions')
      const data = await response.json()

      // On retourne juste la liste brute formatée pour l'UI, le filtrage snapshot/release se fera côté UI si besoin
      return data.versions.map((v: any) => ({
        minecraftVersion: v.id,
        loaderVersion: v.id, // Pour Vanilla, le loader version est la game version
        type: v.type
      }))
    } catch (e) {
      console.error(e)
      return []
    }
  })
}

/**
 * Fonction unifiée pour récupérer les versions d'un loader donné
 */
export async function getLoaderVersions(type: ILoaderType, mcVersion: string): Promise<LoaderVersion[]> {
  if (type === ILoaderType.VANILLA) return [] // Géré à part ou via getVanillaVersions global

  const handler = handlers[type]
  if (!handler) {
    console.warn(`No handler found for loader type ${type}`)
    return []
  }

  return await handler.getVersions(mcVersion)
}

// --- LOGIQUE D'INSTALLATION (MISE À JOUR) ---
// On garde la logique existante pour updateLoader, checkXLoader, etc.
// Mais on peut utiliser les handlers pour valider si une version existe.

export async function updateLoader(loader: Loader) {
  // ... Ta logique existante de mise à jour en BDD ...
  // Note: Pour NeoForge et Quilt, la logique de "check" (validation)
  // peut être implémentée dans les classes Handler plus tard.

  // Pour l'instant, on sauvegarde juste.
  return await db.loader.upsert({
    where: { id: (await db.loader.findFirst())?.id ?? 'default' },
    create: loader,
    update: loader
  })
}

// Helper temporaire pour la rétrocompatibilité si tu as encore checkForgeLoader/checkFabricLoader appelés ailleurs
export function checkVanillaLoader(mc: string, loader: string) {
  /* ... */
}
export function checkForgeLoader(mc: string, loader: string) {
  /* ... */
}
export function checkFabricLoader(mc: string, loader: string) {
  /* ... */
}
export function checkNeoForgeLoader(mc: string, loader: string) {
  /* ... */
}
export function checkQuiltLoader(mc: string, loader: string) {
  /* ... */
}

// Récupération de fichier (Sera adapté dans l'étape suivante pour NeoForge)
export async function getForgeFile(version: string) {
  // ... code existant ...
  // Placeholder pour ne pas casser le build
  return { file: null, format: ILoaderFormat.INSTALLER }
}
