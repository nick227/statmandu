import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { TrendingUp } from 'lucide-react-native'
import { useCardDistribution } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { useNativeColor } from '@/lib/theme'
import { athleteFullName } from './cardDisplay'

const CONTEXT_LABEL: Record<string, string> = {
  PROFILE: 'Profile',
  HOME: 'Home',
  EXPLORE: 'Explore',
  CARD_STUDIO: 'Card Studio',
  SHARED_LINK: 'Shared link',
  DIRECT: 'Direct',
}

// "Athletes want to know how many cards were downloaded and from where" —
// owner-only distribution view. Shown alongside the storefront rail on the
// athlete's own Cards tab, not to public visitors (that's what
// ConnectedCardProfileRail's canEdit gate already handles for its caller).
export function ConnectedCardDistributionPanel({ athleteProfileId }: { athleteProfileId: string }) {
  const distribution = useCardDistribution(athleteProfileId)
  const data = distribution.data?.data
  const brandColor = useNativeColor('brand')

  if (distribution.isLoading || distribution.isError || !data || data.totalDownloads === 0) return null

  return (
    <View className="gap-sm px-lg">
      <View className="flex-row items-center gap-xs">
        <TrendingUp size={16} color={brandColor} />
        <Text className="font-semibold">Card distribution</Text>
      </View>

      <View className="flex-row gap-sm">
        <Card className="flex-1">
          <CardContent className="gap-xs">
            <Text variant="caption">Total downloads</Text>
            <Text variant="statValue">{data.totalDownloads}</Text>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="gap-xs">
            <Text variant="caption">Unique fans</Text>
            <Text variant="statValue">{data.uniqueDownloaders}</Text>
          </CardContent>
        </Card>
      </View>

      {data.byContext.length > 0 ? (
        <View className="flex-row flex-wrap gap-xs">
          {data.byContext
            .slice()
            .sort((a, b) => b.count - a.count)
            .map((entry) => (
              <View key={entry.context} className="rounded-pill border border-border bg-surface px-sm py-xs">
                <Text variant="caption">{CONTEXT_LABEL[entry.context] ?? entry.context}: {entry.count}</Text>
              </View>
            ))}
        </View>
      ) : null}

      {data.byCard.length > 0 ? (
        <View className="gap-xs">
          <Text variant="caption">Top cards</Text>
          {data.byCard.slice(0, 5).map(({ card, count }) => (
            <Link key={card.id} href={{ pathname: '/cards/[cardId]', params: { cardId: card.id, source: 'CARD_STUDIO' } } as never} asChild>
              <Pressable className="flex-row items-center justify-between border-b border-border py-xs active:opacity-70">
                <Text numberOfLines={1} className="flex-1 pr-sm">{card.title} — {athleteFullName(card)}</Text>
                <Text variant="caption">{count} downloads</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </View>
  )
}
