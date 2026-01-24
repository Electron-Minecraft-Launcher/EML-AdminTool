import type { File as File_ } from './types'

export const IUserStatus = {
  /**
   * The user is active and can log in.
   */
  ACTIVE: 'ACTIVE',
  /**
   * The user is pending for approval and **can** log in.
   */
  PENDING: 'PENDING',
  /**
   * The user is flagged as spam (wrong PIN) and **can** log in.
   */
  SPAM: 'SPAM',
  /**
   * The user is deleted and **cannot** log in.
   */
  DELETED: 'DELETED'
} as const

export const ILoaderType = {
  VANILLA: 'VANILLA',
  FORGE: 'FORGE',
  NEOFORGE: 'NEOFORGE',
  FABRIC: 'FABRIC',
  QUILT: 'QUILT'
} as const

export const ILoaderFormat = {
  INSTALLER: 'INSTALLER',
  UNIVERSAL: 'UNIVERSAL',
  CLIENT: 'CLIENT'
} as const

export const IBackgroundStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const

export const IStatAction = {
  STARTUP: 'STARTUP',
  LOGIN: 'LOGIN',
  LAUNCH: 'LAUNCH',
  DEVTOOLS: 'DEVTOOLS'
} as const

export type UserStatus = (typeof IUserStatus)[keyof typeof IUserStatus]
export type LoaderType = (typeof ILoaderType)[keyof typeof ILoaderType]
export type LoaderFormat = (typeof ILoaderFormat)[keyof typeof ILoaderFormat]
export type BackgroundStatus = (typeof IBackgroundStatus)[keyof typeof IBackgroundStatus]
export type StatAction = (typeof IStatAction)[keyof typeof IStatAction]

export interface Environment {
  id: string
  language: string
  name: string
  theme: string
  pin: string
  updatedAt: Date
}

export interface User {
  id: string
  username: string
  /**
   * **Never send this field to the client.**
   */
  password?: string
  status: UserStatus
  isAdmin: boolean
  /**
   * `0` — no access, `1` — write files, `2` — read and write files, and change loader
   */
  p_filesUpdater: number
  /**
   * `0` — no access, `1` — write
   */
  p_bootstraps: number
  /**
   * `0` — no access, `1` — write
   */
  p_maintenance: number
  /**
   * `0` — no access, `1` — write news and delete their own news, `2` — write news and delete any news
   */
  p_news: number
  /**
   * `0` — no access, `1` — write
   */
  p_newsCategories: number
  /**
   * `0` — no access, `1` — write
   */
  p_newsTags: number
  /**
   * `0` — no access, `1` — write
   */
  p_backgrounds: number
  /**
   * `0` — no access, `1` — read, `2` — read and reset
   */
  p_stats: number
  createdAt: Date
  updatedAt: Date
}

export interface Log {
  id: string
  userId?: string
  action: StatAction
  details?: string
  timestamp: Date
}

export interface Loader {
  id: string
  type: LoaderType
  minecraftVersion: string
  loaderVersion: string
  format: LoaderFormat
  file?: File_ | null
  updatedAt: Date
}

export interface Bootstrap {
  id: string
  winFile: File_
  macFile: File_
  linFile: File_
  version: string
  updatedAt: Date
}

export interface Maintenance {
  id: string
  startTime?: Date
  endTime?: Date
  message: string
}

export interface News {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}

export interface NewsCategory {
  id: string
  name: string
  createdAt: Date
}

export interface NewsTag {
  id: string
  name: string
  color: string
}

export interface Background {
  id: string
  name: string
  file: File_
  status: BackgroundStatus
  createdAt: Date
  updatedAt: Date
}

export interface Stat {
  id: string
  action: StatAction
  value?: string
  createdAt: Date
}

export interface ExpiredToken {
  id: string
  token: string
  expiredAt: Date
}

export type ExtendedNews = News & {
  author: { id: string; username: string }
  categories: { name: string; id: string; createdAt: Date }[]
  tags: { name: string; id: string; color: string }[]
}

