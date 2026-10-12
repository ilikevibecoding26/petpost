import { useSyncExternalStore } from 'react'
import { getDB, subscribe } from './store'

export function useDB() {
  return useSyncExternalStore(subscribe, getDB)
}

export function useMe() {
  const db = useDB()
  return db.users.find((u) => u.id === db.sessionUserId) ?? null
}
