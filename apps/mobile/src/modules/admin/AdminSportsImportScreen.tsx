import { Pressable, View } from 'react-native'
import { Stack } from 'expo-router'
import { Check, DatabaseZap } from 'lucide-react-native'
import { Screen } from '@/shared/layout'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Text } from '@/shared/ui/Text'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { useStatusNativeColor } from '@/lib/theme'
import { useSportsImport, type SportsImportScope } from '@/modules/admin/useSportsImport'

const SCOPES: Array<{ id: SportsImportScope; label: string; detail: string }> = [
  { id: 'teams', label: 'Teams', detail: 'Names, countries, and logos' },
  { id: 'games', label: 'Games', detail: 'Schedule, results, and scores' },
  { id: 'standings', label: 'Standings', detail: 'Wins, losses, and rank' },
  { id: 'stats', label: 'Stats', detail: 'Imported aggregate stat lines' },
]

function Count({ label, value, tone }: { label: string; value: number; tone?: 'verified' | 'dispute' }) {
  return (
    <View className="min-w-24 gap-xs rounded-md bg-muted p-sm">
      <Text className="text-2xl font-semibold">{value}</Text>
      <Badge tone={tone}>{label}</Badge>
    </View>
  )
}

export function AdminSportsImportScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const sportsImport = useSportsImport()
  const { providers, run, unresolved, error, leagueId, setLeagueId, season, setSeason, scopes, toggleScope, dateFrom, setDateFrom, dateTo, setDateTo, teamId, setTeamId, gameIdsText, setGameIdsText, recentCompletedGames, setRecentCompletedGames } = sportsImport
  const brand = useStatusNativeColor('brand')

  if (!isAuthLoading && !isAdmin) {
    return <Screen title="Import sports data"><ErrorState message="Admin access required." /></Screen>
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Admin · Import' }} />
      <ConnectedActAsBar />

      <View className="gap-xs">
        <View className="flex-row items-center gap-sm">
          <DatabaseZap size={24} color={brand} />
          <Text className="text-2xl font-semibold">Import public statistics</Text>
        </View>
        <Text variant="caption">Preview normalized API-Sports data before changing Statman records.</Text>
      </View>

      <Card>
        <CardContent className="gap-md">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-semibold">API-Sports · Basketball</Text>
              <Text variant="caption">
                {providers.data?.data?.[0]?.plan ?? 'free'} plan · detail batch size {providers.data?.data?.[0]?.detailBatchSize ?? 1}
              </Text>
            </View>
            {providers.isLoading ? <LoadingState /> : (
              <Badge tone={(providers.data?.data?.[0]?.quota.remaining ?? 0) > 10 ? 'verified' : 'dispute'}>
                {`${providers.data?.data?.[0]?.quota.remaining ?? 0} / ${providers.data?.data?.[0]?.quota.limit ?? 100} left`}
              </Badge>
            )}
          </View>

          <View className="gap-xs">
            <Text>API league ID</Text>
            <Input accessibilityLabel="API league ID" value={leagueId} onChangeText={setLeagueId} placeholder="For example, 12" autoCapitalize="none" />
          </View>
          <View className="gap-xs">
            <Text>Season</Text>
            <Input accessibilityLabel="Season" value={season} onChangeText={setSeason} placeholder="2025-2026" autoCapitalize="none" />
          </View>

          <View className="gap-sm">
            <Text className="font-semibold">Import scopes</Text>
            <View className="flex-row flex-wrap gap-sm">
              {SCOPES.map((scope) => {
                const selected = scopes.includes(scope.id)
                return (
                  <Pressable
                    key={scope.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleScope(scope.id)}
                    className={`min-h-12 min-w-36 flex-row items-center gap-sm rounded-md border p-sm ${selected ? 'border-foreground bg-muted' : 'border-border bg-background'}`}
                  >
                    <View className="h-6 w-6 items-center justify-center rounded-sm border border-border">
                      {selected ? <Check size={16} color={brand} /> : null}
                    </View>
                    <View>
                      <Text className="font-semibold">{scope.label}</Text>
                      <Text variant="caption">{scope.detail}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {scopes.includes('stats') ? (
            <View className="gap-sm rounded-md border border-border p-md">
              <View className="gap-xs">
                <Text className="font-semibold">Detailed enrichment target</Text>
                <Text variant="caption">Schedules and standings remain league-wide. These filters only limit detailed team and player box scores.</Text>
              </View>
              <View className="flex-row flex-wrap gap-sm">
                <View className="min-w-40 flex-1 gap-xs">
                  <Text>From date</Text>
                  <Input accessibilityLabel="Detailed stats from date" value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" autoCapitalize="none" />
                </View>
                <View className="min-w-40 flex-1 gap-xs">
                  <Text>Through date</Text>
                  <Input accessibilityLabel="Detailed stats through date" value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" autoCapitalize="none" />
                </View>
              </View>
              <View className="gap-xs">
                <Text>Team provider ID</Text>
                <Input accessibilityLabel="Detailed stats team provider ID" value={teamId} onChangeText={setTeamId} placeholder="Optional team ID" autoCapitalize="none" />
              </View>
              <View className="gap-xs">
                <Text>Explicit game IDs</Text>
                <Input accessibilityLabel="Explicit game provider IDs" value={gameIdsText} onChangeText={setGameIdsText} placeholder="372186, 372187" autoCapitalize="none" />
                <Text variant="caption">Comma, space, or line separated. Explicit IDs override the recent-game limit.</Text>
              </View>
              <View className="gap-xs">
                <Text>Recent completed games</Text>
                <Input accessibilityLabel="Recent completed game limit" value={recentCompletedGames} onChangeText={setRecentCompletedGames} keyboardType="number-pad" placeholder="20" />
                <Text variant="caption">Defaults to the 20 most recent completed games after date and team filters.</Text>
              </View>
            </View>
          ) : null}

          <Button
            disabled={!sportsImport.canPreview || sportsImport.isPreviewing}
            isLoading={sportsImport.isPreviewing}
            onPress={sportsImport.preview}
          >
            Preview changes
          </Button>
        </CardContent>
      </Card>

      {error ? <ErrorState message={error.message || 'The import request failed.'} /> : null}

      {run ? (
        <Card>
          <CardContent className="gap-md">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold">Import preview</Text>
                <Text variant="caption">Run {run.id} · {run.status}</Text>
              </View>
              <Badge tone={run.status === 'COMPLETED' ? 'verified' : unresolved.length ? 'dispute' : undefined}>{run.status}</Badge>
            </View>
            <View className="flex-row flex-wrap gap-sm">
              <Count label="Create" value={run.createdCount} tone="verified" />
              <Count label="Update" value={run.updatedCount} />
              <Count label="Unchanged" value={run.unchangedCount} />
              <Count label="Conflicts" value={unresolved.length} tone={unresolved.length ? 'dispute' : undefined} />
            </View>
            <View className="rounded-md bg-muted p-sm">
              <Text className="font-semibold">Estimated detailed-stat cost: {run.estimatedRequestCost ?? 0} requests</Text>
              <Text variant="caption">Run cap: {run.detailRequestCap ?? 10} · completed: {run.detailRequestsCompleted ?? 0}</Text>
              <Text variant="caption">Available now: {run.quota?.minuteRemaining ?? 0} this minute · {run.quota?.remaining ?? 0} today</Text>
              <Text variant="caption">
                Team stats {run.capabilities?.teamStats ? 'supported' : 'unsupported'} · player box scores {run.capabilities?.playerBoxScores ? 'supported' : 'unsupported'} · season totals {run.capabilities?.seasonTotals ? 'supported' : 'unsupported'}
              </Text>
            </View>
            {unresolved.length ? (
              <View className="gap-sm">
                <Text className="font-semibold">Resolve possible duplicates</Text>
                {unresolved.map((record: any) => (
                  <View key={record.id} className="gap-sm rounded-md border border-border p-sm">
                    <View>
                      <Text className="font-semibold">{record.externalName}</Text>
                      <Text variant="caption">Suggested: {record.differences?.suggestedName} · {Math.round((record.differences?.confidence ?? 0) * 100)}% confidence</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-sm">
                      <Button
                        size="sm"
                        disabled={sportsImport.isResolving}
                        onPress={() => sportsImport.resolveRecord({ runId: run.id, recordId: record.id, resolution: 'MATCH', localId: record.localId })}
                      >
                        Match suggestion
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={sportsImport.isResolving}
                        onPress={() => sportsImport.resolveRecord({ runId: run.id, recordId: record.id, resolution: 'CREATE' })}
                      >
                        Create separately
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={sportsImport.isResolving}
                        onPress={() => sportsImport.resolveRecord({ runId: run.id, recordId: record.id, resolution: 'SKIP' })}
                      >
                        Skip
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            <View className="gap-xs">
              {(run.records ?? []).slice(0, 12).map((record: any) => (
                <View key={record.id} className="flex-row items-center justify-between border-b border-border py-sm">
                  <View className="shrink gap-xs">
                    <Text className="font-semibold">{record.externalName ?? record.entityType}</Text>
                    <Text variant="caption">{record.entityType} · provider ID {record.externalId}</Text>
                  </View>
                  <Badge tone={record.action === 'CONFLICT' ? 'dispute' : record.action === 'CREATE' ? 'verified' : undefined}>{record.action}</Badge>
                </View>
              ))}
              {(run.records?.length ?? 0) > 12 ? <Text variant="caption">And {(run.records?.length ?? 0) - 12} more records</Text> : null}
            </View>
            <Button
              disabled={!['READY', 'PARTIAL', 'FAILED'].includes(run.status) || unresolved.length > 0 || sportsImport.isExecuting}
              isLoading={sportsImport.isExecuting}
              onPress={() => sportsImport.execute(run.id)}
            >
              {run.status === 'PARTIAL' || run.status === 'FAILED' ? 'Resume import' : 'Execute import'}
            </Button>
            <Text variant="caption">Execution is idempotent: provider mappings prevent duplicate records on rerun.</Text>
          </CardContent>
        </Card>
      ) : null}
    </Screen>
  )
}
