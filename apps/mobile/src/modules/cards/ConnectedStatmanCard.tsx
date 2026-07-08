import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { StatmanCard, type StatmanCardSize } from './StatmanCard'
import { ConnectedCardClaimButton } from './ConnectedCardClaimButton'
import { isEditableCardStatus } from './builder/cardFromApi'

type Card = components['schemas']['Card']

export interface ConnectedStatmanCardProps {
  card: Card
  size?: StatmanCardSize
  /** Owner-only context (draft/generating/failed) — passed through to StatmanCard. */
  showStatus?: boolean
  /** When true, unfinished owned cards open Card Studio instead of the public detail page. */
  editInStudio?: boolean
  className?: string
}

export function ConnectedStatmanCard({
  card,
  size = 'rail',
  showStatus = false,
  editInStudio = false,
  className,
}: ConnectedStatmanCardProps) {
  const openStudio = editInStudio && showStatus && isEditableCardStatus(card.status)

  return (
    <Link
      href={
        openStudio
          ? ({ pathname: '/cards/studio', params: { cardId: card.id } } as never)
          : ({ pathname: '/cards/[cardId]', params: { cardId: card.id } } as never)
      }
      asChild
    >
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
