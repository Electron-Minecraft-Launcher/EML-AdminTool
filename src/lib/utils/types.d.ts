import type { LanguageCode } from '../stores/language'

export type Env = {
  language: LanguageCode
  name: string
  theme: string
  version: string
}

export interface VPS {
  os: string
  storage: number[]
}

export interface Update {
  currentVersion: string
  latestVersion: string
  releaseDate: string
  logoUrl: string
  changelogs: string
}

export interface File {
  /**
   * The name of the file.
   */
  name: string
  /**
   * The path of the file, without the name and the leading slash, but with the trailing slash (e.g. `'path/to/file/'`).
   */
  path: string
  /**
   * The size of the file in bytes.
   */
  size?: number
  /**
   * The SHA1 hash of the file.
   */
  sha1?: string
  /**
   * The URL to download the file.
   */
  url: string
  /**
   * The type of the file.
   *
   * `'JAVA'` — Java files
   *
   * `'ASSET'` — Minecraft asset
   *
   * `'LIBRARY'` — Minecraft library
   *
   * `'NATIVE'` — Minecraft native
   *
   * `'MOD'` — Mod from the modpack (hosted on EML AdminTool)
   *
   * `'CONFIG'` — Configuration file
   *
   * `'OTHER'` — Other files
   */
  type: 'JAVA' | 'ASSET' | 'LIBRARY' | 'NATIVE' | 'MOD' | 'CONFIG' | 'BOOTSTRAP' | 'BACKGROUND' | 'FOLDER' | 'IMAGE' | 'OTHER'
}

export type Dir = 'files-updater' | 'loader' | 'bootstraps' | 'backgrounds' | 'images' | 'cache'

export interface LoaderVersion {
  majorVersion: string
  minecraftVersion: string
  loaderVersion: string
  type: ('release' | 'snapshot' | 'beta' | 'alpha' | 'latest' | 'recommended' | 'default')[]
}
