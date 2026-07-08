import { Link } from 'expo-router'
import { Pressable, View } from 'react-native'
import { User, Users, CalendarDays } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { SmartImage } from '@/shared/media/SmartImage'
import { useNativeColor } from '@/lib/theme'

type SearchResultItem = components['schemas']['SearchResultItem']

const ROUTE_BY_TYPE = {
  PLAYER: (id: string) => ({ pathname: '/players/[playerId]' as const, params: { playerId: id } }),
  TEAM: (id: string) => ({ pathname: '/teams/[teamId]' as const, params: { teamId: id } }),
  GAME: (id: string) => ({ pathname: '/games/[gameId]' as const, params: { gameId: id } }),
}

const TYPE_LABEL: Record<SearchResultItem['type'], string> = {
  PLAYER: 'Player',
  TEAM: 'Team',
  GAME: 'Game',
}

const TYPE_ICON: Record<SearchResultItem['type'], React.ComponentType<{ size?: number; color?: string }>> = {
  PLAYER: User,
  TEAM: Users,
  GAME: CalendarDays,
}

export function SearchResultLink({ result }: { result: SearchResultItem }) {
  const Icon = TYPE_ICON[result.type]
  const mutedColor = useNativeColor('mutedText')

  return (
    <Link href={ROUTE_BY_TYPE[result.type](result.id)} asChild>
      <Pressable className="flex-row items-center gap-sm px-lg py-sm">
        <SmartImage
          uri={result.imageUrl}
          className="h-12 w-12 rounded-md"
          fallback={<Icon size={20} color={mutedColor} />}
        />
        <View className="flex-1 gap-xs">
          <Text className="font-semibold" numberOfLines={1}>{result.title}</Text>
          {result.subtitle ? (
            <Text variant="caption" numberOfLines={1}>{result.subtitle}</Text>
          ) : null}
        </View>
        <Badge tone="brand">{TYPE_LABEL[result.type]}</Badge>
      </Pressable>
    </Link>
  )
}
