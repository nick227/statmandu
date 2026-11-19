import { View } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { usePerson, useAthleteCards } from '@statman/sdk'
import { Screen } from '@/shared/layout'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { sharePublicEntity } from '@/shared/share/sharePublicEntity'

export function ConnectedPersonScreen() {
  const { personId } = useLocalSearchParams<{ personId: string }>()
  const person = usePerson(personId)
  const cards = useAthleteCards(personId)
  return <Screen title={person.data?.data.displayName ?? 'Person'} withBack scroll>
    <View className="gap-md p-lg">
      {person.isLoading ? <Text>Loading…</Text> : null}
      {person.error ? <Text>{person.error.message}</Text> : null}
      <Text>{person.data?.data.bio ?? ''}</Text>
      <Button variant="secondary" onPress={() => { void sharePublicEntity({ title: person.data?.data.displayName ?? 'Person', path: `/people/${personId}` }).catch(() => {}) }}>Share profile</Button>
      <Link href="/cards/studio" asChild><Button>Create a card</Button></Link>
      <Text className="text-lg font-semibold">Cards</Text>
      {cards.error ? <Text>{cards.error.message}</Text> : null}
      {cards.data?.data.map(card => <Link key={card.id} href={{ pathname: '/cards/[cardId]', params: { cardId: card.id } }} asChild><Button variant="secondary">{card.title}</Button></Link>)}
    </View>
  </Screen>
}
