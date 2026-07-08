import type { ReactNode } from 'react'
import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { SpotlightCard } from './SpotlightCard'

export interface EntityTileProps extends PressableProps {
  name: string
  imageUri?: string | null
  meta?: string | null
  stat?: string | null
  className?: string
  style?: StyleProp<ViewStyle>
}

function StatPill({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
      <Text variant="caption" className="text-center text-white/80" numberOfLines={1}>{children}</Text>
    </View>
  )
}

export function EntityTile({ name, imageUri, meta, stat, className, style, ...props }: EntityTileProps) {
  return (
    <SpotlightCard
      size="small"
      kind="athlete"
      title={name}
      subtitle={meta ?? undefined}
      imageUri={imageUri}
      footer={stat ? <StatPill>{stat}</StatPill> : undefined}
      className={cn(className)}
      style={style}
      {...props}
    />
  )
}
