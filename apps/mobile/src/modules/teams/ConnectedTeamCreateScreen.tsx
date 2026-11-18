import { useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useCreateTeam, useLeagues } from '@statman/sdk'
import { Shield } from 'lucide-react-native'
import { Screen } from '@/shared/layout'
import { Button } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Text } from '@/shared/ui/Text'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { cn } from '@/lib/utils'

export function ConnectedTeamCreateScreen() {
  const router = useRouter()
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const leaguesQuery = useLeagues()
  const createTeam = useCreateTeam()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [leagueId, setLeagueId] = useState('')
  const leagues = leaguesQuery.data?.data ?? []
  const selectedLeague = leagues.find((league) => league.id === leagueId)

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Screen title="Create team" withBack contentClassName="px-lg">
        <SignInPrompt message="Sign in to create a team." />
      </Screen>
    )
  }
  if (leaguesQuery.isError) {
    return <Screen title="Create team" withBack><ErrorState message="Leagues couldn't be loaded." /></Screen>
  }
  if (isAuthLoading || leaguesQuery.isLoading) {
    return <Screen title="Create team" withBack><LoadingState /></Screen>
  }

  async function submit() {
    const cleanName = name.trim()
    if (!cleanName) {
      Alert.alert('Team name required', 'Enter the public name of the team.')
      return
    }
    if (!leagueId) {
      Alert.alert('League required', 'Choose the league this team belongs to.')
      return
    }
    if (logoUrl.trim() && !/^https?:\/\//i.test(logoUrl.trim())) {
      Alert.alert('Check the logo URL', 'Use a complete http:// or https:// URL.')
      return
    }

    try {
      const created = await createTeam.mutateAsync({
        name: cleanName,
        leagueId,
        city: city.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
      })
      router.replace({ pathname: '/teams/[teamId]', params: { teamId: created.data.id } })
    } catch (error) {
      Alert.alert('Team not created', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <Screen scroll title="Create team" withBack contentClassName="gap-lg px-lg">
      <View className="flex-row items-center gap-md rounded-md border border-border bg-surface p-md">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-brand/10">
          <Shield size={22} color="#2563EB" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-semibold">Team identity</Text>
          <Text variant="caption">The URL is generated automatically from the team name.</Text>
        </View>
      </View>

      <View className="gap-xs">
        <Text className="font-semibold">Team name</Text>
        <Input accessibilityLabel="Team name" value={name} onChangeText={setName} placeholder="Westview Hawks" autoCapitalize="words" />
      </View>

      <View className="gap-xs">
        <Text className="font-semibold">League</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {leagues.map((league) => {
            const selected = league.id === leagueId
            return (
              <Pressable
                key={league.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setLeagueId(league.id)}
                className={cn(
                  'min-h-[52px] min-w-40 justify-center rounded-md border px-md py-sm active:opacity-70',
                  selected ? 'border-brand bg-brand/10' : 'border-border bg-surface',
                )}
              >
                <Text className={cn('font-semibold', selected && 'text-brand')} numberOfLines={1}>{league.name}</Text>
                <Text variant="caption" numberOfLines={1}>{league.sport?.name ?? 'Sport'}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
        {leagues.length === 0 ? <Text variant="caption">No leagues are available. A league must exist before a team can be created.</Text> : null}
      </View>

      <View className="gap-xs">
        <Text className="font-semibold">City or community</Text>
        <Input accessibilityLabel="Team city or community" value={city} onChangeText={setCity} placeholder="Optional" autoCapitalize="words" />
      </View>

      <View className="gap-xs">
        <Text className="font-semibold">Logo URL</Text>
        <Input accessibilityLabel="Team logo URL" value={logoUrl} onChangeText={setLogoUrl} placeholder="https://… (optional)" autoCapitalize="none" keyboardType="url" />
      </View>

      {selectedLeague ? (
        <View className="rounded-md border border-brand/30 bg-brand/10 p-md">
          <Text className="font-semibold">{name.trim() || 'New team'}</Text>
          <Text variant="caption">{[city.trim(), selectedLeague.name, selectedLeague.sport?.name].filter(Boolean).join(' · ')}</Text>
        </View>
      ) : null}

      <Button disabled={!name.trim() || !leagueId} isLoading={createTeam.isPending} onPress={submit}>Create team</Button>
    </Screen>
  )
}
