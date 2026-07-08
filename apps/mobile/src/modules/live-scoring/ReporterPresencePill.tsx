import { Users } from 'lucide-react-native'
import { Badge } from '@/shared/ui/Badge'

export interface ReporterPresencePillProps {
  count: number
  className?: string
}

// Presence-only, per design decision — GameSnapshot already returns
// reporterCount (no backend change needed), but a full per-reporter identity
// list is blocked by the still-missing GET /games/{id}/reporters endpoint
// (see CLAUDE.md). This is deliberately just "how many," not "who."
export function ReporterPresencePill({ count, className }: ReporterPresencePillProps) {
  if (count <= 1) return null
  return (
    <Badge tone="brand" icon={Users} className={className}>
      {`${count} reporting`}
    </Badge>
  )
}
