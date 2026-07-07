import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Screen } from '@/shared/layout'
import { useAccountSession } from '@/modules/account/useAccountSession'
import { clearStoredToken } from '@/lib/sdk'

export function AccountScreen() {
  const router = useRouter()
  const { isLoading, logout, user } = useAccountSession()

  if (isLoading) {
    return <LoadingState />
  }

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
