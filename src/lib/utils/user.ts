import { getContext } from 'svelte'
import { currentUser } from '$lib/stores/user'
import type { UserInfo } from './db'

export default function getUser(): UserInfo {
  const user = getContext<UserInfo>('user')
  currentUser.set(user)
  return user
}

