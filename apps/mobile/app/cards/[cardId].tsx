import { useLocalSearchParams } from 'expo-router'
import { CardDetailScreen } from '@/modules/cards/CardDetailScreen'

export default function CardDetailRoute() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>()
  return <CardDetailScreen cardId={cardId} />
}
