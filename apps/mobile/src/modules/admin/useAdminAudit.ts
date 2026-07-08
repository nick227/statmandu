import { useAdminAuditLog } from '@statman/sdk'

export function useAdminAudit() {
  const audit = useAdminAuditLog({ limit: 50 })
  return { audit }
}

