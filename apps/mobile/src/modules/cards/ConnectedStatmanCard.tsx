import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { StatmanCard, type StatmanCardSize } from './StatmanCard'
import { ConnectedCardClaimButton } from './ConnectedCardClaimButton'

type Card = components['schemas']['Card']

export interface ConnectedStatmanCardProps {
  card: Card
  size?: StatmanCardSize
  /** Owner-only context (draft/generating/failed) — passed through to StatmanCard. */
  showStatus?: boolean
  className?: string
}

// StatmanCard wired to navigation and (only at "featured" size, where a
// direct CTA makes sense — see CardDropSection) an inline claim action.
// Rail-sized tiles stay purely navigational: "CTA should drive back to
// athlete profile/card detail, not generic feed" per the module brief.
export function ConnectedStatmanCard({ card, size = 'rail', showStatus = false, className }: ConnectedStatmanCardProps) {
  return (
    <Link href={{ pathname: '/cards/[cardId]', params: { cardId: card.id } }} asChild>
      <StatmanCard
        card={card}
        size={size}
        showStatus={showStatus}
        className={className}
        footer={size === 'featured' && !showStatus ? <ConnectedCardClaimButton card={card} compact className="mt-xs" /> : undefined}
      />
    </Link>
  )
}
