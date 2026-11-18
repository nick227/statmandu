import { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useGame, useRecordGameScore } from '@statman/sdk'
import { Screen } from '@/shared/layout'
import { Button } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Text } from '@/shared/ui/Text'
import { useAuthGate } from '@/modules/auth/useAuthGate'

export function ConnectedHistoricalScoreScreen({ gameId }: { gameId: string }) {
  const router = useRouter()
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const gameQuery = useGame(gameId)
  const recordScore = useRecordGameScore(gameId)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const game = gameQuery.data?.data
  const home = game?.gameTeams.find((team) => team.isHome)
  const away = game?.gameTeams.find((team) => !team.isHome)

  useEffect(() => {
    if (home?.finalScore != null) setHomeScore(String(home.finalScore))
    if (away?.finalScore != null) setAwayScore(String(away.finalScore))
  }, [home?.finalScore, away?.finalScore])

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Screen title="Add score" withBack contentClassName="px-lg">
        <SignInPrompt message="Sign in to add or correct this game score." />
      </Screen>
    )
  }

  if (gameQuery.isError) {
    return <Screen title="Add score" withBack><ErrorState message="This game couldn't be loaded." /></Screen>
  }
  if (gameQuery.isLoading || !game || !home || !away) {
    return <Screen title="Add score" withBack><LoadingState /></Screen>
  }

  async function save() {
    const parsedHome = Number(homeScore)
    const parsedAway = Number(awayScore)
    if (!Number.isInteger(parsedHome) || parsedHome < 0 || !Number.isInteger(parsedAway) || parsedAway < 0) {
      Alert.alert('Check the score', 'Enter a whole number of zero or greater for both teams.')
      return
    }

    try {
      await recordScore.mutateAsync({ homeScore: parsedHome, awayScore: parsedAway })
      router.replace({ pathname: '/games/[gameId]', params: { gameId } })
    } catch (error) {
      Alert.alert('Score not saved', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <Screen scroll title="Add score" withBack contentClassName="gap-lg px-lg">
      <View className="rounded-md border border-border bg-surface p-md">
        <Text className="font-semibold">Historical score entry</Text>
        <Text variant="caption">This records the final team totals. It does not start a live broadcast.</Text>
      </View>

      <ScoreInput label={home.team?.name ?? 'Home'} value={homeScore} onChangeText={setHomeScore} />
      <ScoreInput label={away.team?.name ?? 'Away'} value={awayScore} onChangeText={setAwayScore} />

      <Button isLoading={recordScore.isPending} onPress={save}>Save final score</Button>
    </Screen>
  )
}

function ScoreInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View className="gap-xs">
      <Text className="font-semibold">{label}</Text>
      <Input
        accessibilityLabel={`${label} score`}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        inputMode="numeric"
        placeholder="0"
      />
    </View>
  )
}
