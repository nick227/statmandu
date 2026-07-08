import { CheckCircle2, AlertTriangle } from 'lucide-react-native'
import { Badge } from '@/shared/ui/Badge'
import { sourceStatusColor } from '@/lib/theme'

const ICON: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  VERIFIED_TEAM_ACCOUNT: CheckCircle2,
  IN_DISPUTE: AlertTriangle,
}

const LABEL: Record<string, string> = {
  PLAYER_REPORTED: 'Player reported',
  SPECTATOR_REPORTED: 'Spectator reported',
  MULTI_SPECTATOR_CONFIRMED: 'Spectator consensus',
  TEAM_MANAGER_ENTERED: 'Team manager',
  OFFICIAL_SCORER_RECORDED: 'Official scorer',
  VERIFIED_TEAM_ACCOUNT: 'Verified team',
  ONLINE_SOURCE_IMPORTED: 'Online source',
  PUBLIC_SOURCE_SCRAPED: 'Public scrape',
  IN_DISPUTE: 'Disputed',
}

export interface PlayerSourceBadgeProps {
  status: string
  className?: string
}

// Visually minimal per brand guide ("Source and dispute details are
// accessible but visually minimal") — a small pill, not a warning banner.
export function PlayerSourceBadge({ status, className }: PlayerSourceBadgeProps) {
  return (
    <Badge tone={sourceStatusColor(status)} icon={ICON[status]} className={className}>
      {LABEL[status] ?? status}
    </Badge>
  )
}
