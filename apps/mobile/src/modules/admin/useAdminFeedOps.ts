import { useAdminCreateFeedItem } from '@statman/sdk'

export function useAdminFeedOps() {
  const createFeedItem = useAdminCreateFeedItem()
  return { createFeedItem }
}

