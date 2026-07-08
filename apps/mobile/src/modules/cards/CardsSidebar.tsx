import { View } from 'react-native'
import { useRouter } from 'expo-router'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import {
  SidebarActionRow,
  SidebarBrandPanel,
  SidebarChip,
  SidebarPanel,
  SidebarRail,
} from '@/shared/layout'
import { CARD_TYPES } from '@/modules/cards/builder/builderConstants'
import { CARDS_BROWSE_FILTERS, type CardsBrowseFilter } from '@/modules/cards/useCardsBrowse'
import { isEditableCardStatus } from '@/modules/cards/builder/cardFromApi'

type Card = components['schemas']['Card']
type MyCard = components['schemas']['MyCard']

export interface CardsSidebarProps {
  filter: CardsBrowseFilter
  onFilterChange: (filter: CardsBrowseFilter) => void
  isAuthenticated: boolean
  inProgress: Card[]
  claimed: MyCard[]
}

export function CardsSidebar({
  filter,
  onFilterChange,
  isAuthenticated,
  inProgress,
  claimed,
}: CardsSidebarProps) {
  const router = useRouter()

  return (
    <SidebarRail>
      <SidebarBrandPanel
        title="Card Studio"
        subtitle="Create collectible drops. Browse new releases in the main column."
      />

      <SidebarPanel title="Create a card" subtitle="Subject → photo → type → style → generate → publish.">
        <View className="flex-row flex-wrap gap-xs pb-xs">
          {CARD_TYPES.slice(0, 4).map((type) => (
            <View key={type.value} className="rounded-sm border border-border bg-canvas px-sm py-xs">
              <Text variant="statLabel" className="text-muted-text">{type.label}</Text>
            </View>
          ))}
        </View>
        {isAuthenticated ? (
          <Button onPress={() => router.push('/cards/studio')}>Create a card</Button>
        ) : (
          <SignInPrompt message="Sign in to open Card Studio" className="items-start py-xs" />
        )}
      </SidebarPanel>

      <SidebarPanel title="Browse" subtitle="Filter the public drop board.">
        <View className="flex-row flex-wrap gap-xs">
          {CARDS_BROWSE_FILTERS.map((item) => (
            <SidebarChip
              key={item.key}
              label={item.label}
              active={filter === item.key}
              onPress={() => onFilterChange(item.key)}
            />
          ))}
        </View>
      </SidebarPanel>

      {isAuthenticated && inProgress.length > 0 ? (
        <SidebarPanel title="Continue in Studio" subtitle="Unfinished drafts reopen the generator.">
          {inProgress.slice(0, 5).map((card) => (
            <SidebarActionRow
              key={card.id}
              title={card.title}
              meta={card.athlete?.displayName ?? card.status}
              href={{ pathname: '/cards/studio', params: { cardId: card.id } }}
            />
          ))}
        </SidebarPanel>
      ) : null}

      {isAuthenticated && claimed.length > 0 ? (
        <SidebarPanel title="Your claims" subtitle="Copies you've claimed.">
          {claimed.slice(0, 5).map(({ card, issue }) => (
            <SidebarActionRow
              key={issue.id}
              title={card.title}
              meta={card.athlete?.displayName ?? 'Claimed'}
              href={{ pathname: '/cards/[cardId]', params: { cardId: card.id } }}
            />
          ))}
        </SidebarPanel>
      ) : null}
    </SidebarRail>
  )
}

export function partitionOwnedCards(created: Card[]) {
  return {
    inProgress: created.filter((card) => isEditableCardStatus(card.status)),
    published: created.filter((card) => card.status === 'PUBLISHED'),
  }
}
