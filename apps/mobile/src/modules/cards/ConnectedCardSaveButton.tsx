import { useMemo } from 'react'
import { useMyCardSaves, useSaveCard, useUnsaveCard } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { useAuthGate } from '@/modules/auth/useAuthGate'

export interface ConnectedCardSaveButtonProps {
  cardTemplateId: string
  compact?: boolean
  className?: string
}

// Lightweight save/collect — the prerequisite for a personal "Collections"
// view (see /cards discovery page), deliberately simpler than claim
// (no edition/issue number implications, just a bookmark). Same
// logged-out-hides-the-button boundary as ConnectedCardClaimButton/
// ConnectedFollowButton use for other write actions on public screens —
// no button at all when signed out, rather than a SignInPrompt, since this
// is a secondary action next to Share/Download, not the primary CTA.
export function ConnectedCardSaveButton({ cardTemplateId, compact, className }: ConnectedCardSaveButtonProps) {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const { data: saves } = useMyCardSaves({ enabled: isAuthenticated })
  const save = useSaveCard()
  const unsave = useUnsaveCard()

  const mySave = useMemo(
    () => saves?.data.find((s) => s.cardTemplateId === cardTemplateId),
    [saves, cardTemplateId]
  )

  if (isAuthLoading || !isAuthenticated) return null

  const isSaved = Boolean(mySave)

  return (
    <Button
      variant={isSaved ? 'secondary' : 'ghost'}
      size={compact ? 'sm' : 'md'}
      className={className}
      isLoading={save.isPending || unsave.isPending}
      onPress={() => {
        if (isSaved && mySave) unsave.mutate(mySave.id)
        else save.mutate(cardTemplateId)
      }}
    >
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  )
}
