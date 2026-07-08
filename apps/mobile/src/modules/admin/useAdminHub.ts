import { useAdminMetrics } from '@statman/sdk'

export function useAdminHub() {
  const metrics = useAdminMetrics()
  return { metrics }
}

