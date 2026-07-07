import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useCurrentUser, useLogout } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Screen } from '@/components/layout'
import { clearStoredToken } from '@/lib/sdk'

// Me/Dashboard — surface 12: my profile, pending actions (disputes/claims
// queue for admins), and account controls.
export default function MeScreen() {
  const router = useRouter()
  const { data, isLoading } = useCurrentUser()
  const logout = useLogout()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Spinner />
      </View>
    )
  }

  const user = data?.data
  const isAdmin = user?.role === 'ADMIN'

  return (
    <Screen contentClassName="gap-md p-lg">
      <View className="flex-row items-center gap-md">
        <Avatar uri={user?.profile?.avatarUrl} fallback={user?.profile?.displayName ?? user?.email ?? '?'} size="lg" />
        <View>
          <Text variant="entityName" className="text-2xl">{user?.profile?.displayName}</Text>
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
