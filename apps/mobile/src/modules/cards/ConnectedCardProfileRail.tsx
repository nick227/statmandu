import { View } from 'react-native'
import { Link } from 'expo-router'
import { Sparkles } from 'lucide-react-native'
import { useAthleteCards } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { CardRail } from './CardRail'

export interface ConnectedCardProfileRailProps {
  athleteProfileId: string
  /** The claiming user viewing their own profile — sees draft/generating status and a create CTA. */
  canEdit: boolean
  className?: string
}

// Athlete profile Cards section — rail of published cards for public
// viewers, plus the owner's own in-progress cards (any status) when they're
// looking at their own profile.
export function ConnectedCardProfileRail({ athleteProfileId, canEdit, className }: ConnectedCardProfileRailProps) {
  const cardsQuery = useAthleteCards(athleteProfileId)
  const cards = cardsQuery.data?.data ?? []

  if (cardsQuery.isLoading || cardsQuery.isError) return null

  if (cards.length === 0) {
    return (
      <View className={className ?? 'gap-sm px-lg'}>
        <EmptyState
          icon={Sparkles}
          title={canEdit ? 'Create your first Statman Card' : 'No cards released yet'}
          description={
            canEdit
              ? 'Turn a stat line or big moment into a collectible card fans can claim.'
              : 'Check back after this athlete publishes a card.'
          }
        />
        {canEdit ? (
          <Link href={'/cards/studio' as never} asChild>
            <Button variant="secondary">Create a card</Button>
          </Link>
        ) : null}
      </View>
    )
  }

  return (
    <View className={className ?? 'gap-sm'}>
      <CardRail cards={cards} showStatus={canEdit} className="gap-sm px-lg" />
      {canEdit ? (
        <Link href={'/cards/studio' as never} asChild>
          <Button variant="ghost" size="sm" className="mx-lg self-start">+ New card</Button>
        </Link>
      ) : null}
    </View>
  )
}
