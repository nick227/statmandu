import { View } from 'react-native'
import { Stack, Link, type Href } from 'expo-router'
import { ShieldCheck, Users, GraduationCap, CalendarClock, Newspaper, ScrollText, type LucideIcon } from 'lucide-react-native'
import { Screen } from '@/shared/layout'
import { Card, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Button } from '@/shared/ui/Button'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { useAdminHub } from '@/modules/admin/useAdminHub'
import { useStatusNativeColor } from '@/lib/theme'

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-sm">
      <Text>{label}</Text>
      <Text className="font-semibold">{value}</Text>
    </View>
  )
}

function AdminLinkCard({ href, title, subtitle, icon: Icon }: { href: Href; title: string; subtitle: string; icon: LucideIcon }) {
  const color = useStatusNativeColor('brand')
  return (
    <Link href={href} asChild>
      <Card>
        <CardContent className="gap-xs">
          <View className="flex-row items-center gap-sm">
            <Icon size={18} color={color} />
            <Text className="font-semibold">{title}</Text>
          </View>
          <Text variant="caption">{subtitle}</Text>
        </CardContent>
      </Card>
    </Link>
  )
}

export function AdminHubScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { metrics } = useAdminHub()
  const verifiedColor = useStatusNativeColor('verified')

  if (!isAuthLoading && !isAdmin) {
    return (
      <Screen title="Admin">
        <Stack.Screen options={{ headerShown: true, title: 'Admin' }} />
        <ErrorState message="Admin access required." />
      </Screen>
    )
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Admin' }} />
      <ConnectedActAsBar />

      <Card>
        <CardContent className="gap-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-sm">
              <ShieldCheck size={18} color={verifiedColor} />
              <Text className="font-semibold">Visibility</Text>
            </View>
            <Badge tone="verified">Admin</Badge>
          </View>

          {metrics.isError ? (
            <ErrorState message="Metrics couldn't be loaded." />
          ) : metrics.isLoading ? (
            <LoadingState />
          ) : (
            <View>
              <MetricRow label="Players" value={metrics.data?.data.playersCount ?? 0} />
              <MetricRow label="Teams" value={metrics.data?.data.teamsCount ?? 0} />
              <MetricRow label="Games" value={metrics.data?.data.gamesCount ?? 0} />
              <MetricRow label="Pending claims" value={metrics.data?.data.pendingClaimsCount ?? 0} />
              <MetricRow label="Open disputes" value={metrics.data?.data.openDisputesCount ?? 0} />
              <MetricRow label="Live games" value={metrics.data?.data.liveGamesCount ?? 0} />
            </View>
          )}
        </CardContent>
      </Card>

      <View className="gap-sm">
        <Text className="font-semibold">Operations</Text>
        <AdminLinkCard href={'/admin/athletes' as Href} title="Onboard athletes" subtitle="Create and bulk-import players." icon={GraduationCap} />
        <AdminLinkCard href={'/admin/teams' as Href} title="Onboard teams" subtitle="Manage teams and rosters." icon={Users} />
        <AdminLinkCard href={'/admin/games' as Href} title="Create/manage games" subtitle="Schedule, jump into capture, finalize." icon={CalendarClock} />
        <AdminLinkCard href={'/admin/feed' as Href} title="Seed feed" subtitle="Create feed items and attach media." icon={Newspaper} />
        <AdminLinkCard href={'/admin/audit' as Href} title="Audit log" subtitle="Accountability for admin actions." icon={ScrollText} />
      </View>

      <Button variant="secondary" onPress={() => metrics.refetch()}>
        Refresh
      </Button>
    </Screen>
  )
}

