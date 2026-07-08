import { Pressable, View } from 'react-native'
import type { ComponentType, ReactNode } from 'react'
import { Link, useRouter } from 'expo-router'
import { Activity, Radio, ShieldCheck, Trophy, UserRound } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { LoadingState } from '@/shared/ui/LoadingState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Screen } from '@/shared/layout'
import { useAccountSession } from '@/modules/account/useAccountSession'
import { clearStoredToken } from '@/lib/sdk'
import { useStatusNativeColor } from '@/lib/theme'

function HubIcon({ icon: Icon, tone = 'brand' }: { icon: ComponentType<{ size?: number; color?: string }>; tone?: 'brand' | 'verified' | 'muted-text' }) {
  const color = useStatusNativeColor(tone)
  return <Icon size={18} color={color} />
}

function LinkedHubCard({ children }: { children: ReactNode }) {
  return (
    <Pressable className="active:opacity-70">
      <Card>{children}</Card>
    </Pressable>
  )
}

export function AccountScreen() {
  const router = useRouter()
  const { capabilities, isCapabilitiesLoading, isError, isLoading, logout, user } = useAccountSession()

  if (isLoading) {
    return <LoadingState />
  }

  // isError here almost always just means "not signed in" (useCurrentUser's
  // query fails with 401) — this tab's whole purpose requires an account,
  // so a sign-in prompt is the right fallback, not a generic error message.
  if (isError || !user) {
    return (
      <Screen title="Me">
        <SignInPrompt message="Sign in to view your account." />
      </Screen>
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const athleteProfiles = capabilities?.athleteProfiles ?? []
  const reporterAssignments = capabilities?.reporterAssignments ?? []

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <View className="flex-row items-center gap-md">
        <Avatar uri={user?.profile?.avatarUrl} fallback={user?.profile?.displayName ?? user?.email ?? '?'} size="lg" />
        <View className="flex-1">
          <Text className="text-2xl font-bold">{user?.profile?.displayName}</Text>
          <Text variant="caption">{user?.profile?.username ? `@${user.profile.username}` : user?.email}</Text>
        </View>
        <Badge tone={isAdmin ? 'verified' : 'muted-text'}>{isAdmin ? 'Admin' : 'Neutral'}</Badge>
      </View>

      <View className="gap-sm">
        <Text className="font-semibold">Your Profiles</Text>
        {isCapabilitiesLoading ? <Skeleton className="h-20 w-full" /> : null}
        {!isCapabilitiesLoading && athleteProfiles.map((profile) => (
          <Link key={profile.playerId} href={{ pathname: '/players/[playerId]', params: { playerId: profile.playerId } }} asChild>
            <LinkedHubCard>
              <CardContent className="gap-xs">
                <View className="flex-row items-center justify-between gap-sm">
                  <View className="flex-1 flex-row items-center gap-sm">
                    <HubIcon icon={UserRound} tone="verified" />
                    <Text className="font-semibold" numberOfLines={1}>{profile.name}</Text>
                  </View>
                  <Badge tone="verified">Claimed</Badge>
                </View>
                <Text variant="caption">{[profile.currentTeamName, profile.sportSlug].filter(Boolean).join(' · ')}</Text>
              </CardContent>
            </LinkedHubCard>
          </Link>
        ))}
        {!isCapabilitiesLoading && athleteProfiles.length === 0 ? (
          <Link href="/players/create" asChild>
            <LinkedHubCard>
              <CardContent className="gap-xs">
                <View className="flex-row items-center gap-sm">
                  <HubIcon icon={UserRound} />
                  <Text className="font-semibold">Create athlete profile</Text>
                </View>
                <Text variant="caption">Launch the Lightning Wizard for identity, sport fit, proof, media, and preview.</Text>
              </CardContent>
            </LinkedHubCard>
          </Link>
        ) : null}
      </View>

      <View className="gap-sm">
        <Text className="font-semibold">Your Roles</Text>
        {isCapabilitiesLoading ? <Skeleton className="h-20 w-full" /> : null}
        {!isCapabilitiesLoading && reporterAssignments.map((assignment) => (
          <Link key={assignment.id} href={{ pathname: '/games/[gameId]/live', params: { gameId: assignment.gameId } }} asChild>
            <LinkedHubCard>
              <CardContent className="gap-xs">
                <View className="flex-row items-center justify-between gap-sm">
                  <View className="flex-1 flex-row items-center gap-sm">
                    <HubIcon icon={assignment.canManageGame ? Trophy : Radio} tone={assignment.canManageGame ? 'brand' : 'muted-text'} />
                    <Text className="font-semibold" numberOfLines={1}>{assignment.gameLabel}</Text>
                  </View>
                  <Badge tone={assignment.canManageGame ? 'brand' : 'muted-text'}>{assignment.role.replace(/_/g, ' ')}</Badge>
                </View>
                <Text variant="caption">{[assignment.teamName, new Date(assignment.scheduledAt).toLocaleDateString()].filter(Boolean).join(' · ')}</Text>
              </CardContent>
            </LinkedHubCard>
          </Link>
        ))}
        {!isCapabilitiesLoading && reporterAssignments.length === 0 ? (
          <Card>
            <CardContent className="gap-xs">
              <View className="flex-row items-center gap-sm">
                <HubIcon icon={Trophy} tone="muted-text" />
                <Text className="font-semibold">Team and reporter tools</Text>
              </View>
              <Text variant="caption">Team management, roster, and reporter assignments appear here when unlocked.</Text>
            </CardContent>
          </Card>
        ) : null}
      </View>

      <View className="gap-sm">
        <Text className="font-semibold">Activity</Text>
        <Link href="/disputes" asChild>
          <LinkedHubCard>
            <CardContent className="gap-xs">
              <View className="flex-row items-center gap-sm">
                <HubIcon icon={Activity} />
                <Text className="font-semibold">Disputes & corrections</Text>
              </View>
              <Text variant="caption">Submitted corrections and their status.</Text>
            </CardContent>
          </LinkedHubCard>
        </Link>
      </View>

      {isAdmin ? (
        <View className="gap-sm">
          <Text className="font-semibold">Management</Text>
          <Link href="/claims" asChild>
            <LinkedHubCard>
              <CardContent className="gap-xs">
                <View className="flex-row items-center gap-sm">
                  <HubIcon icon={ShieldCheck} tone="verified" />
                  <Text className="font-semibold">Profile claims queue</Text>
                </View>
                <Text variant="caption">Review pending athlete profile claims.</Text>
              </CardContent>
            </LinkedHubCard>
          </Link>
        </View>
      ) : null}

      <Button
        variant="secondary"
        isLoading={logout.isPending}
        onPress={async () => {
          await logout.mutateAsync()
          await clearStoredToken()
          router.replace('/login')
        }}
      >
        Log out
      </Button>
    </Screen>
  )
}
