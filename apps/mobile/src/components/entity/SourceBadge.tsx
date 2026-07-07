import { Badge } from '@/components/ui/Badge'
import { sourceStatusColor } from '@/lib/theme'

const LABEL: Record<string, string> = {
  SELF_REPORTED: 'Self-reported',
  TEAM_ENTERED: 'Team entered',
  MANAGER_APPROVED: 'Manager approved',
  IMPORTED_SOURCE: 'Imported',
  SCRAPED_PUBLIC: 'Public source',
  VERIFIED: 'Verified',
  IN_DISPUTE: 'Disputed',
}

export interface SourceBadgeProps {
  status: string
  className?: string
}

// Visually minimal per brand guide ("Source and dispute details are
// accessible but visually minimal") — a small pill, not a warning banner.
export function SourceBadge({ status, className }: SourceBadgeProps) {
  return (
    <Badge tone={sourceStatusColor(status)} className={className}>
      {LABEL[status] ?? status}
    </Badge>
  )
}
