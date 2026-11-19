import { Button } from '@/shared/ui/Button'
import { Pressable, ScrollView, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/lib/utils'
import type { useCardBuilderData } from './useCardBuilderData'

// Shared "choose the athlete" step body — used by both the manual
// single-card builder and the batch photo-to-pose-set generator, which
// otherwise duplicated this exact search+select UI verbatim.
export function SubjectPicker({ builderData }: { builderData: ReturnType<typeof useCardBuilderData> }) {
  const { createPerson, addPerson } = builderData
  return (
    <View className="gap-md">
      <Input value={builderData.athleteQuery} onChangeText={builderData.setAthleteQuery} placeholder="Find a person by name" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {builderData.playerOptions.map((player) => (
          <Pressable
            key={player.id}
            onPress={() => builderData.selectPlayer(player)}
            className={cn('min-w-44 rounded-md border p-sm', player.selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}
          >
            <Text className={cn('font-semibold', player.selected ? 'text-brand' : 'text-text')}>{player.name}</Text>
            <Text variant="caption" numberOfLines={1}>{player.teamName}</Text>
            {player.selected ? <Text variant="caption" className="text-brand">Selected</Text> : null}
          </Pressable>
        ))}
      </ScrollView>
      {builderData.playerOptions.length === 0 ? (
        <View className="rounded-md border border-dashed border-border bg-canvas p-md">
          <Text variant="caption">No people found. Add a person to create their first card.</Text>
        </View>
      ) : null}
      <Button variant="secondary" disabled={!builderData.athleteQuery.trim()} isLoading={createPerson.isPending} onPress={() => { void addPerson().catch(() => {}) }}>Add this person</Button>
      {createPerson.error ? <Text>{createPerson.error.message}</Text> : null}
    </View>
  )
}
