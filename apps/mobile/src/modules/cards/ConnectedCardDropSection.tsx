import { useRecentCards } from '@statman/sdk'
import { ContentSection } from '@/shared/layout/ContentSection'
import { ConnectedStatmanCard } from './ConnectedStatmanCard'
import { CardRail } from './CardRail'

// Home's "New Drops" module — one featured card (with an inline claim CTA)
// plus a rail of the next few most-recent public cards. Deliberately just
// one more ContentSection alongside Home's existing video/athlete/game
// sections rather than a bespoke layout, so it doesn't compete with the
// editorial rhythm already established there. No "See all" — there's no
// full cards list page (module brief: no marketplace), so every card here
// links straight to its own detail screen instead.
export function ConnectedCardDropSection() {
  const cardsQuery = useRecentCards()
  const cards = cardsQuery.data?.data ?? []

  if (cardsQuery.isLoading || cardsQuery.isError || cards.length === 0) return null

  const [featured, ...rest] = cards

  return (
    <ContentSection title="New Drops" subtitle="Fresh Statman Cards, ready to claim.">
      <ConnectedStatmanCard card={featured} size="featured" />
      {rest.length > 0 ? <CardRail cards={rest} className="gap-sm pt-sm" /> : null}
    </ContentSection>
  )
}
