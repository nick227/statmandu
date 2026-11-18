import type { components } from '@statman/sdk'
import { useClaimCard } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { claimedStatusMessage } from './cardDisplay'

type Card = components['schemas']['Card']

export interface CardClaimButtonViewProps {
  card: Card
  isAuthenticated: boolean
  isAuthLoading: boolean
  compact?: boolean
  className?: string
}

// The actual claim/sign-in/claimed rendering logic, taking auth state as
// props rather than subscribing to it itself. Split out so a caller that
// already has auth state in scope (e.g. one rendered inside a virtualized
// FlatList, where a second independent useCurrentUser() subscriber nested
// inside the list was observed live to send react-query's query into an
// infinite refetch loop specific to that FlatList context) can reuse this
// view without adding another subscription — see CardsGrid in
// CardManagerScreen.tsx for that call site.
export function CardClaimButtonView({ card, isAuthenticated, isAuthLoading, compact, className }: CardClaimButtonViewProps) {
  const claim = useClaimCard()

  if (isAuthLoading) return null

  if (!isAuthenticated) {
    return <SignInPrompt message="Sign in to claim this card" className={className ?? (compact ? 'py-xs' : 'py-sm')} />
  }

  if (card.currentUserHasClaimed) {
    return (
      <Badge tone="verified" className={className}>
        {claimedStatusMessage(card, card.currentUserIssue?.issueNumber)}
      </Badge>
    )
  }

  const fullyClaimed = card.editionMode !== 'UNLIMITED' && card.editionSize != null && card.issuedCount >= card.editionSize
  if (fullyClaimed) {
    return <Badge tone="muted-text" className={className}>Edition fully claimed</Badge>
  }

  if (card.status !== 'PUBLISHED' || card.visibility !== 'PUBLIC') return null

  return (
    <Button
      size={compact ? 'sm' : 'md'}
      isLoading={claim.isPending}
      className={className}
      onPress={() => claim.mutate(card.id)}
    >
      Claim this card
    </Button>
  )
}

export interface ConnectedCardClaimButtonProps {
  card: Card
  compact?: boolean
  className?: string
}

// Self-sufficient wrapper (subscribes to auth state itself) for callers
// that aren't already inside a component with auth state in scope — e.g.
// CardDetailScreen, a single-instance screen where an extra
// useCurrentUser() subscriber is fine. Claim requires login for MVP — a
// logged-out tap shows SignInPrompt inline instead of a hard redirect,
// matching ConnectedFollowButton's established pattern for write actions
// on otherwise-public screens.
export function ConnectedCardClaimButton({ card, compact, className }: ConnectedCardClaimButtonProps) {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  return (
    <CardClaimButtonView
      card={card}
      isAuthenticated={isAuthenticated}
      isAuthLoading={isAuthLoading}
      compact={compact}
      className={className}
    />
  )
}
