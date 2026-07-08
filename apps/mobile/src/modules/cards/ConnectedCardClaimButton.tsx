import type { components } from '@statman/sdk'
import { useClaimCard } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { claimedStatusMessage } from './cardDisplay'

type Card = components['schemas']['Card']

export interface ConnectedCardClaimButtonProps {
  card: Card
  compact?: boolean
  className?: string
}

// Claim requires login for MVP — a logged-out tap shows SignInPrompt
// inline instead of a hard redirect, matching ConnectedFollowButton's
// established pattern for write actions on otherwise-public screens.
export function ConnectedCardClaimButton({ card, compact, className }: ConnectedCardClaimButtonProps) {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
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
