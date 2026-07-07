import { Badge } from '@/components/ui/Badge'
import { gameStatusColor } from '@/lib/theme'

const LABEL: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  FINAL: 'Final',
  DISPUTED: 'Disputed',
}

export interface GameStatusBadgeProps {
  status: string
  className?: string
}

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  return (
    <Badge tone={gameStatusColor(status)} className={className}>
      {LABEL[status] ?? status}
    </Badge>
  )
}
