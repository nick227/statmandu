import { View } from 'react-native'
import { CreditCard } from 'lucide-react-native'
import { Screen } from '@/shared/layout/Screen'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { CardRail } from '@/modules/cards/CardRail'
import { useCardManager } from '@/modules/cards/useCardManager'
import { useRouter } from 'expo-router'

export function CardManagerScreen() {
  const router = useRouter()
  const manager = useCardManager()

  if (manager.isError) {
    return (
      <Screen title="Trading Cards" insetTop={false}>
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
      <Screen title="Trading Cards" scroll contentClassName="gap-md p-lg" insetTop={false}>
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
    <Screen title="Trading Cards" scroll contentClassName="gap-md p-lg" insetTop={false}>
      {manager.createdCards.length > 0 ? (
        <View className="gap-sm">
          <View className="px-xs">
            <Button variant="ghost" size="sm" disabled>
              Created
            </Button>
          </View>
          <CardRail cards={manager.createdCards} showStatus className="gap-sm" />
        </View>
      ) : null}

      {manager.claimedCards.length > 0 ? (
        <View className="gap-sm">
          <View className="px-xs">
            <Button variant="ghost" size="sm" disabled>
              Claimed
            </Button>
          </View>
          <CardRail cards={manager.claimedCards.map((c) => c.card)} className="gap-sm" />
        </View>
      ) : null}

      <Button variant="secondary" onPress={() => router.push('/cards/studio')}>
        New card
      </Button>
    </Screen>
  )
}

