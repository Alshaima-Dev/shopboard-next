import type { Language } from '../products/product-types.ts'
type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>
import { getLanguage } from './i18n.ts'

// Preferences use a separate key and never touch the saved shopping cart.
export function createLanguageStore(storage?: StorageAdapter | null) {
  if (storage === undefined) {
    try {
      storage = globalThis.localStorage
    } catch {
      storage = null
    }
  }
  let language: Language = 'en'
  try {
    language = getLanguage(storage?.getItem('shopboard-language'))
  } catch {
    // Keep English when the saved preference cannot be read.
  }
  return {
    getLanguage: () => language,
    setLanguage(value: unknown) {
      language = getLanguage(value)
      try {
        storage?.setItem('shopboard-language', language)
      } catch {
        // Keep the in-memory language selection when saving is unavailable.
      }
      return language
    },
  }
}

// Provider-local snapshots: SSR and the first hydration render always use EN.
export function createLanguageController() {
  let store = createLanguageStore(null)
  let language = store.getLanguage()
  let restored = false
  const listeners = new Set<() => void>()
  function publish() {
    language = store.getLanguage()
    for (const listener of listeners) listener()
  }
  function restore(storage?: StorageAdapter | null) {
    if (restored) return
    restored = true
    store = createLanguageStore(storage)
    publish()
  }
  return {
    getSnapshot: () => language,
    getServerSnapshot: (): Language => 'en',
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    restore,
    setLanguage(value: unknown) {
      if (!restored) restore()
      store.setLanguage(value)
      publish()
    },
  }
}

