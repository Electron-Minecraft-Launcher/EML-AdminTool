import { IUserStatus, type UserInfo } from '$lib/utils/db'
import type { UserStatus } from '@prisma/client'
import { writable, derived, type Readable, type Writable } from 'svelte/store'

export const currentUser: Writable<UserInfo> = writable<UserInfo>()

export const user: Readable<UserInfo> = derived(currentUser, ($currentUser) => {
  return $currentUser
})

export const emptyUser: UserInfo & { status: UserStatus; createdAt: Date; updatedAt: Date } = {
  id: '0',
  username: '',
  isAdmin: false,
  status: IUserStatus.ACTIVE,
  p_filesUpdater: 0,
  p_bootstraps: 0,
  p_maintenance: 0,
  p_news: 0,
  p_newsCategories: 0,
  p_newsTags: 0,
  p_backgrounds: 0,
  p_stats: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}
