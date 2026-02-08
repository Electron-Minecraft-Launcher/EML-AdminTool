import type { LanguageCode } from '$lib/stores/language'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      isConfigured: boolean
      env: {
        language: LanguageCode
        name: string
        theme: string
        version: string
        serverIp?: string | null
      }
      user?: {
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
      },
      logStatus?: number
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
