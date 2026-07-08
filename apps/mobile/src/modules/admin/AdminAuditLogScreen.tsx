import { View } from 'react-native'
import { Stack } from 'expo-router'
import { Screen } from '@/shared/layout'
import { Text } from '@/shared/ui/Text'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Card, CardContent } from '@/shared/ui/Card'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { useAdminAudit } from '@/modules/admin/useAdminAudit'

export function AdminAuditLogScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { audit } = useAdminAudit()

  if (!isAuthLoading && !isAdmin) {
    return (
      <Screen title="Audit Log">
        <Stack.Screen options={{ headerShown: true, title: 'Audit Log' }} />
        <ErrorState message="Admin access required." />
      </Screen>
    )
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Audit Log' }} />
      <ConnectedActAsBar />
      {audit.isError ? (
        <ErrorState message="Audit log couldn't be loaded." />
      ) : audit.isLoading ? (
        <LoadingState />
      ) : (
        <View className="gap-sm">
          {(audit.data?.data ?? []).map((row: any) => (
            <Card key={row.id}>
              <CardContent className="gap-xs">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold">{row.action}</Text>
                  <Text variant="caption">{new Date(row.createdAt).toLocaleString()}</Text>
                </View>
                <Text variant="caption">{row.method} {row.path}</Text>
                <Text variant="caption">actor={row.actorUserId}{row.subjectUserId ? ` as=${row.subjectUserId}` : ''}</Text>
                {row.note ? <Text variant="caption">{row.note}</Text> : null}
              </CardContent>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  )
}

