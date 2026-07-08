import { View } from 'react-native'
import { CreditCard } from 'lucide-react-native'
import { Screen } from '@/shared/layout/Screen'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { Text } from '@/shared/ui/Text'
import { CardRail } from '@/modules/cards/CardRail'
import { useCardManager } from '@/modules/cards/useCardManager'
import { useRouter } from 'expo-router'

function SectionLabel({ children }: { children: string }) {
  return <Text variant="statLabel" className="px-xs text-muted-text">{children}</Text>
}

export function CardManagerScreen() {
  const router = useRouter()
  const manager = useCardManager()

  if (manager.isError) {
    return (
      <Screen title="Trading Cards" insetTop={false} contentClassName="px-md">
        <ErrorState message="Your cards couldn't be loaded." />
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

  if (manager.createdCards.length === 0 && manager.claimedCards.length === 0) {
    return (
      <Screen title="Trading Cards" scroll contentClassName="gap-md px-md pb-xxl" insetTop={false}>
        <EmptyState
          icon={CreditCard}
          title="No cards yet"
          description="Create your first Statman Card to share with fans."
        />
        <Button variant="secondary" onPress={() => router.push('/cards/studio')}>
          Create a card
        </Button>
      </Screen>
    )
  }

  return (
    <Screen title="Trading Cards" scroll contentClassName="gap-lg px-md pb-xxl" insetTop={false}>
      <Text variant="caption">
        Cards you've designed and cards claimed from drops live here.
      </Text>

      {manager.createdCards.length > 0 ? (
        <View className="gap-sm">
          <SectionLabel>Created</SectionLabel>
          <CardRail cards={manager.createdCards} showStatus className="gap-sm" />
        </View>
      ) : null}

      {manager.claimedCards.length > 0 ? (
        <View className="gap-sm">
          <SectionLabel>Claimed</SectionLabel>
          <CardRail cards={manager.claimedCards.map((c) => c.card)} className="gap-sm" />
        </View>
      ) : null}

      <Button variant="secondary" onPress={() => router.push('/cards/studio')}>
        New card
      </Button>
    </Screen>
  )
}
