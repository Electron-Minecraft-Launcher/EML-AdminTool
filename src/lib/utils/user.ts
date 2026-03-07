import { getContext } from 'svelte'
import { currentUser } from '$lib/stores/user'
import type { UserInfo } from './db'

export default function getUser(): UserInfo {
  const user = getContext<{
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
  }>('user')
  currentUser.set(user)
  return user
}

