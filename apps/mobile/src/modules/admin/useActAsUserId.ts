import { useSyncExternalStore } from 'react'
import { getActAsUserId, subscribeActAsUserId } from '@/lib/adminHeaders'

export function useActAsUserId() {
  return useSyncExternalStore(subscribeActAsUserId, getActAsUserId, getActAsUserId)
}

