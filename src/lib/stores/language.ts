import { writable, derived, type Readable, type Writable } from 'svelte/store'
import en from '../locales/en'
import fr from '../locales/fr'
import da from '../locales/da'
import de from '../locales/de'
import it from '../locales/it'
import ja from '../locales/ja'

const languages = { en, fr, da, de, it, ja }

export type LanguageCode = keyof typeof languages
export const currentLanguage: Writable<LanguageCode> = writable<LanguageCode>('en')

type TranslationObject = typeof en
type CallableTranslation<T> = T & {
  (vars: Record<string, string | number>): CallableTranslation<T>
} & {
  [K in keyof T]: T[K] extends object ? CallableTranslation<T[K]> : string
}

export const l: Readable<CallableTranslation<TranslationObject>> = derived(currentLanguage, ($currentLanguage) => {
  const selected = languages[$currentLanguage] ?? en
  return createTranslationProxy(selected, languages.en)
})

function interpolate(text: string, vars: Record<string, string | number>): string {
  if (!text || !vars) return text
  return text.replace(/{{(\w+)}}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  })
}

function createTranslationProxy(selected: any, fallback: any, vars: Record<string, any> = {}): any {
  const target = function (newVars: Record<string, any>) {
    return createTranslationProxy(selected, fallback, { ...vars, ...newVars })
  }

  return new Proxy(target, {
    get(_, key) {
      if (typeof key !== 'string') return undefined

      let value = selected?.[key]

      if (value === undefined && fallback) {
        value = fallback[key]
        if (value !== undefined && typeof value !== 'object') {
          console.warn(`Missing translation for '${String(key)}', using fallback.`)
        }
      }

      if (value === undefined) {
        console.error(`Missing translation for '${String(key)}' in both selected and fallback.`)
        return key
      }

      if (typeof value === 'object' && value !== null) {
        return createTranslationProxy(value, fallback?.[key], vars)
      }

      if (typeof value === 'string') {
        return interpolate(value, vars)
      }

      return value
    },

    apply(target, thisArg, args) {
      return target.apply(thisArg, args as [Record<string, any>])
    }
  })
}
