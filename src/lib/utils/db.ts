import type { Prisma } from '@prisma/client'

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
  QUILT: 'QUILT',
  CUSTOM: 'CUSTOM'
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

export type UserInfo = {
  id: string
  username: string
  isAdmin: boolean
  p_filesUpdater: 0 | 1 | 2
  p_bootstraps: 0 | 1
  p_maintenance: 0 | 1
  p_news: 0 | 1 | 2
  p_newsCategories: 0 | 1
  p_newsTags: 0 | 1
  p_backgrounds: 0 | 1
  p_stats: 0 | 1 | 2
}

export type ExtendedNews = Prisma.NewsGetPayload<{
  include: {
    author: { select: { id: true; username: true } }
    categories: true
    tags: true
  }
}>
