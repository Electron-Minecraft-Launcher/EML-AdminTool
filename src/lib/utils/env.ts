import { getContext } from 'svelte'
import type { Env } from './types'
import { currentLanguage } from '$lib/stores/language'

export default function getEnv(): Env {
  const env = getContext<Env>('env')
  currentLanguage.set(env.language || 'en')
  return env
}

