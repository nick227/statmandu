import type { ComponentProps } from 'react'
import { useRecentCards } from '@statman/sdk'
import { ContentSection } from '@/shared/layout/ContentSection'
import { ConnectedStatmanCard } from './ConnectedStatmanCard'
import { CardRail } from './CardRail'

export interface ConnectedCardDropSectionProps {
  /** CardManagerScreen (`/cards`) is a real public browse board — link to
   *  it when the caller has it in primary nav, e.g. Home. */
  seeAllHref?: ComponentProps<typeof ContentSection>['href']
}

// Home's "New Drops" module — one featured card with an inline claim CTA,
// plus a rail of the next few most-recent public cards. `size="featured"`
// changes surrounding actions, never the locked physical card size. Deliberately just one more
// ContentSection alongside Home's other sections rather than a bespoke
// layout, so it doesn't compete with the editorial rhythm already
// established there.
export function ConnectedCardDropSection({ seeAllHref }: ConnectedCardDropSectionProps = {}) {
  const cardsQuery = useRecentCards()
  const cards = cardsQuery.data?.data ?? []

  if (cardsQuery.isLoading || cardsQuery.isError || cards.length === 0) return null

  const [featured, ...rest] = cards

  return (
    <ContentSection
      title="New Drops"
      subtitle="Fresh Statman Cards, ready to claim."
      href={seeAllHref}
      linkLabel="See all cards"
    >
      <ConnectedStatmanCard card={featured} size="featured" source="HOME" />
      {rest.length > 0 ? <CardRail cards={rest} source="HOME" className="gap-sm pt-sm" /> : null}
    </ContentSection>
  )
}
