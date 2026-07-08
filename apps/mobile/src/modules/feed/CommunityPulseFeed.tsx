import { View } from 'react-native'
import { FeedItemCard } from '@/modules/feed/FeedItemCard'
import { HomeActivityCard } from '@/modules/feed/HomeActivityCard'
import type { CommunityPulseItem } from '@/modules/feed/interleavePulseFeed'
import { ConnectedVideoCard } from '@/modules/media/ConnectedVideoCard'

export interface CommunityPulseFeedProps {
  items: CommunityPulseItem[]
  onVideoPress: (videoIndex: number) => void
}

export function CommunityPulseFeed({ items, onVideoPress }: CommunityPulseFeedProps) {
  return (
    <View className="gap-sm">
      {items.map((item, index) => {
        if (item.kind === 'feed') {
          return <FeedItemCard key={item.id} item={item.feed} index={index} />
        }
        if (item.kind === 'mock') {
          return <HomeActivityCard key={item.id} item={item.mock} large={index === 0} />
        }
        return (
          <ConnectedVideoCard
            key={item.id}
            item={item.video}
            variant="banner"
            onPress={() => onVideoPress(item.videoIndex)}
          />
        )
      })}
    </View>
  )
}
