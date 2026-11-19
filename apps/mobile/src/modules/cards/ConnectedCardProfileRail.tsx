import { View } from 'react-native'
import { Link } from 'expo-router'
import { Sparkles } from 'lucide-react-native'
import { useAthleteCards } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ContentSection } from '@/shared/layout/ContentSection'
import { CardRail } from './CardRail'
import { ConnectedStatmanCard } from './ConnectedStatmanCard'
import { ConnectedCardDistributionPanel } from './ConnectedCardDistributionPanel'

export interface ConnectedCardProfileRailProps {
  athleteProfileId: string
  athleteName: string
  /** The claiming user viewing their own profile — sees draft/generating status and a create CTA. */
  canEdit: boolean
  className?: string
}

// Athlete profile Cards section — the site's actual monetization surface,
// so it gets a real storefront moment rather than a plain status list: one
// large featured card (with its built-in claim CTA) plus a rail of the
// rest, mirroring the exact featured+rail shape ConnectedCardDropSection
// already uses for Home's "New Drops" module. The owner's own unpublished
// drafts (if any) stay visible underneath via the same showStatus/editInStudio
// rail this screen already had.
export function ConnectedCardProfileRail({ athleteProfileId, athleteName, canEdit, className }: ConnectedCardProfileRailProps) {
  const cardsQuery = useAthleteCards(athleteProfileId)
  const cards = cardsQuery.data?.data ?? []

  if (cardsQuery.isLoading || cardsQuery.isError) return null

  const published = cards.filter((c) => c.status === 'PUBLISHED')
  const drafts = canEdit ? cards.filter((c) => c.status !== 'PUBLISHED') : []

  if (published.length === 0) {
    return (
      <View className={className ?? 'gap-lg px-lg'}>
        <EmptyState
          icon={Sparkles}
          title={canEdit ? 'Create your first card' : 'No cards released yet'}
          description={
            canEdit
              ? 'Upload a photo and build a collectible card in Studio — pick your favorites to publish.'
              : 'Check back after this person publishes a card.'
          }
        />
        {canEdit ? (
          <View className="gap-sm">
            <Link href={'/cards/generate' as never} asChild>
              <Button>Create Cards from Photo</Button>
            </Link>
            <Link href={'/cards/studio' as never} asChild>
              <Button variant="ghost">Build one manually instead</Button>
            </Link>
          </View>
        ) : null}
        {drafts.length > 0 ? <CardRail cards={drafts} showStatus editInStudio className="gap-sm" /> : null}
      </View>
    )
  }

  const [featured, ...rest] = published

  return (
    <View className={className ?? 'gap-lg'}>
      <ContentSection
        title={`${athleteName}'s Cards`}
        subtitle="Collect limited-edition releases from this profile."
        className="gap-sm px-lg"
      >
        <ConnectedStatmanCard card={featured} size="featured" source="PROFILE" />
        {rest.length > 0 ? <CardRail cards={rest} source="PROFILE" className="gap-sm pt-sm" /> : null}
      </ContentSection>
      {canEdit ? (
        <View className="gap-sm px-lg">
          <View className="flex-row flex-wrap gap-sm">
            <Link href={'/cards/generate' as never} asChild>
              <Button size="sm">Create Cards from Photo</Button>
            </Link>
            <Link href={'/cards/studio' as never} asChild>
              <Button variant="ghost" size="sm">+ New card</Button>
            </Link>
          </View>
          {drafts.length > 0 ? <CardRail cards={drafts} showStatus editInStudio className="gap-sm pt-sm" /> : null}
        </View>
      ) : null}
      {canEdit ? <ConnectedCardDistributionPanel athleteProfileId={athleteProfileId} /> : null}
    </View>
  )
}
