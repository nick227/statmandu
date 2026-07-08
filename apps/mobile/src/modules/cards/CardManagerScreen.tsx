import { View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { ContentSection } from '@/shared/layout/ContentSection'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { Text } from '@/shared/ui/Text'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { CardRail } from '@/modules/cards/CardRail'
import { ConnectedCardDropSection } from '@/modules/cards/ConnectedCardDropSection'
import { useCardManager } from '@/modules/cards/useCardManager'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { isEditableCardStatus } from '@/modules/cards/builder/cardFromApi'
import { CARD_TYPES } from '@/modules/cards/builder/builderConstants'

function SectionLabel({ children }: { children: string }) {
  return <Text variant="statLabel" className="px-xs text-muted-text">{children}</Text>
}

function StudioHero({ onOpen }: { onOpen: () => void }) {
  return (
    <View className="gap-md overflow-hidden rounded-md border border-border bg-surface p-md">
      <View className="h-1 bg-sport-accent" />
      <View className="gap-xs">
        <Text variant="kicker">Card Studio</Text>
        <Text className="text-xl font-bold text-text">Build a Statman Card</Text>
        <Text variant="caption">
          Pick an athlete, photo, type, and style — then generate collectible artwork fans can claim.
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-xs">
        {CARD_TYPES.slice(0, 4).map((type) => (
          <View key={type.value} className="rounded-sm border border-border bg-canvas px-sm py-xs">
            <Text variant="statLabel" className="text-muted-text">{type.label}</Text>
          </View>
        ))}
      </View>
      <Button onPress={onOpen}>Open Card Studio</Button>
    </View>
  )
}

export function CardManagerScreen() {
  const router = useRouter()
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const manager = useCardManager(isAuthenticated)

  const openStudio = () => router.push('/cards/studio')

  if (isAuthLoading) {
    return (
      <Screen title="Trading Cards" insetTop={false}>
        <LoadingState label="Loading" />
      </Screen>
    )
  }

  if (!isAuthenticated) {
    return (
      <Screen title="Trading Cards" scroll contentClassName="gap-lg px-md pb-xxl" insetTop={false}>
        <StudioHero onOpen={() => router.push('/login')} />
        <ConnectedCardDropSection />
        <View className="gap-md rounded-md border border-border bg-surface p-md">
          <Text className="font-bold">Sign in to create & manage cards</Text>
          <Text variant="caption">
            Card Studio saves drafts to your account, generates artwork, and publishes drops you can claim later.
          </Text>
          <SignInPrompt message="Sign in to use Card Studio" className="items-center py-sm" />
        </View>
      </Screen>
    )
  }

  if (manager.isError) {
    return (
      <Screen title="Trading Cards" insetTop={false} contentClassName="px-md">
        <ErrorState message="Your cards couldn't be loaded." />
        <Button className="mt-md" variant="secondary" onPress={openStudio}>
          Open Card Studio anyway
        </Button>
      </Screen>
    )
  }

  if (manager.isLoading) {
    return (
      <Screen title="Trading Cards" insetTop={false}>
        <LoadingState label="Loading cards" />
      </Screen>
    )
  }

  const inProgress = manager.createdCards.filter((card) => isEditableCardStatus(card.status))
  const published = manager.createdCards.filter((card) => card.status === 'PUBLISHED')
  const hasInventory = manager.createdCards.length > 0 || manager.claimedCards.length > 0

  return (
    <Screen title="Trading Cards" scroll contentClassName="gap-lg px-md pb-xxl" insetTop={false}>
      <StudioHero onOpen={openStudio} />

      {!hasInventory ? (
        <EmptyState
          icon={Sparkles}
          title="No personal cards yet"
          description="Open Card Studio to design your first drop, or claim one from recent releases below."
        />
      ) : null}

      {inProgress.length > 0 ? (
        <View className="gap-sm">
          <SectionLabel>Continue in Studio</SectionLabel>
          <Text variant="caption">Drafts and unfinished cards reopen the generator.</Text>
          <CardRail cards={inProgress} showStatus editInStudio className="gap-sm" />
        </View>
      ) : null}

      {published.length > 0 ? (
        <View className="gap-sm">
          <SectionLabel>Published</SectionLabel>
          <CardRail cards={published} showStatus className="gap-sm" />
        </View>
      ) : null}

      {manager.claimedCards.length > 0 ? (
        <View className="gap-sm">
          <SectionLabel>Claimed</SectionLabel>
          <CardRail cards={manager.claimedCards.map((c) => c.card)} className="gap-sm" />
        </View>
      ) : null}

      <ConnectedCardDropSection />

      <ContentSection title="Studio pipeline" subtitle="Subject → photo → type → style → generate → publish.">
        <Button variant="secondary" onPress={openStudio}>
          Start a new card
        </Button>
      </ContentSection>
    </Screen>
  )
}
