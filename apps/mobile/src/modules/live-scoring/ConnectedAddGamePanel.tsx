import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useCreateGame, useTeams } from '@statman/sdk'
import { Plus, X } from 'lucide-react-native'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'

function defaultScheduledAt() {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ConnectedAddGamePanel({ defaultExpanded = false }: { defaultExpanded?: boolean }) {
  const router = useRouter()
  const teamsQuery = useTeams()
  const createGame = useCreateGame()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt)
  const [venue, setVenue] = useState('')
  const teams = teamsQuery.data?.data ?? []
  const homeTeam = teams.find((team) => team.id === homeTeamId)
  const awayOptions = useMemo(
    () => teams.filter((team) => !homeTeam || (team.id !== homeTeam.id && team.leagueId === homeTeam.leagueId)),
    [homeTeam, teams],
  )

  useEffect(() => {
    if (defaultExpanded) setExpanded(true)
  }, [defaultExpanded])

  function selectHome(teamId: string) {
    setHomeTeamId(teamId)
    const team = teams.find((candidate) => candidate.id === teamId)
    const awayTeam = teams.find((candidate) => candidate.id === awayTeamId)
    if (awayTeam && awayTeam.leagueId !== team?.leagueId) setAwayTeamId('')
  }

  async function submit() {
    if (!homeTeam || !awayTeamId) {
      Alert.alert('Choose both teams', 'Select a home team and an away team to add this game.')
      return
    }
    if (!homeTeam.sport?.slug) {
      Alert.alert('Sport unavailable', 'This team is missing its sport information. Refresh and try again.')
      return
    }

    const parsedDate = new Date(scheduledAt.replace(' ', 'T'))
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert('Check the date', 'Use the format YYYY-MM-DD HH:MM.')
      return
    }

    try {
      const created = await createGame.mutateAsync({
        sportSlug: homeTeam.sport.slug,
        scheduledAt: parsedDate.toISOString(),
        venue: venue.trim() || undefined,
        homeTeamId,
        awayTeamId,
      })
      router.push({ pathname: '/games/[gameId]', params: { gameId: created.data.id } })
    } catch (error) {
      Alert.alert('Game not added', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  if (!expanded) {
    return <Button icon={Plus} onPress={() => setExpanded(true)}>Add game</Button>
  }

  return (
    <View className="gap-md rounded-md border border-border bg-surface p-md">
      <View className="flex-row items-center justify-between gap-sm">
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-bold">Add a game</Text>
          <Text variant="caption">Create it here, then choose actions from its game page.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close add game form"
          onPress={() => setExpanded(false)}
          className="h-11 w-11 items-center justify-center rounded-full border border-border active:opacity-70"
        >
          <X size={18} color="#64748B" />
        </Pressable>
      </View>

      <TeamSelector label="Home team" teams={teams} selectedId={homeTeamId} onSelect={selectHome} />
      <TeamSelector label="Away team" teams={awayOptions} selectedId={awayTeamId} onSelect={setAwayTeamId} />

      <View className="gap-xs">
        <Text className="font-semibold">Date and time</Text>
        <Input
          accessibilityLabel="Game date and time"
          value={scheduledAt}
          onChangeText={setScheduledAt}
          placeholder="YYYY-MM-DD HH:MM"
          autoCapitalize="none"
        />
        <Text variant="caption">Use local time in YYYY-MM-DD HH:MM format.</Text>
      </View>

      <View className="gap-xs">
        <Text className="font-semibold">Venue</Text>
        <Input accessibilityLabel="Game venue" value={venue} onChangeText={setVenue} placeholder="Optional" />
      </View>

      <Button
        isLoading={createGame.isPending}
        disabled={teamsQuery.isLoading || !homeTeamId || !awayTeamId}
        onPress={submit}
      >
        Add and continue
      </Button>
    </View>
  )
}

function TeamSelector({
  label,
  teams,
  selectedId,
  onSelect,
}: {
  label: string
  teams: NonNullable<ReturnType<typeof useTeams>['data']>['data']
  selectedId: string
  onSelect: (teamId: string) => void
}) {
  return (
    <View className="gap-xs">
      <Text className="font-semibold">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {teams.map((team) => {
          const selected = team.id === selectedId
          return (
            <Pressable
              key={team.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(team.id)}
              className={cn(
                'min-h-[44px] min-w-32 justify-center rounded-md border px-sm py-xs active:opacity-70',
                selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas',
              )}
            >
              <Text className={cn('font-semibold', selected && 'text-brand')} numberOfLines={1}>{team.name}</Text>
              {team.city ? <Text variant="caption" numberOfLines={1}>{team.city}</Text> : null}
            </Pressable>
          )
        })}
      </ScrollView>
      {!teams.length ? <Text variant="caption">No eligible teams found.</Text> : null}
    </View>
  )
}
