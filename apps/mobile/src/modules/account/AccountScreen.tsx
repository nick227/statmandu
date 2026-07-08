import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { LoadingState } from '@/shared/ui/LoadingState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Screen } from '@/shared/layout'
import { useAccountSession } from '@/modules/account/useAccountSession'
import { clearStoredToken } from '@/lib/sdk'

export function AccountScreen() {
  const router = useRouter()
  const { isError, isLoading, logout, user } = useAccountSession()

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

  return (
    <Screen contentClassName="gap-md p-lg">
      <View className="flex-row items-center gap-md">
        <Avatar uri={user?.profile?.avatarUrl} fallback={user?.profile?.displayName ?? user?.email ?? '?'} size="lg" />
        <View>
          <Text className="text-2xl font-bold">{user?.profile?.displayName}</Text>
          <Text variant="caption">{user?.email}</Text>
        </View>
      </View>

      {isAdmin ? (
        <Link href="/claims" asChild>
          <Card>
            <CardContent>
              <Text className="font-semibold">Profile claims queue</Text>
              <Text variant="caption">Review pending athlete profile claims</Text>
            </CardContent>
          </Card>
        </Link>
      ) : null}

      <Link href="/disputes" asChild>
        <Card>
          <CardContent>
            <Text className="font-semibold">Disputes & corrections</Text>
            <Text variant="caption">Submitted corrections and their status</Text>
          </CardContent>
        </Card>
      </Link>

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
