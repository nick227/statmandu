import { View } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { Text } from '@/components/ui/Text'
import type { ReactNode } from 'react'

export interface IdentityOverlayProps {
  name: string
  subtitle?: string
  avatarUri?: string | null
  /** e.g. a SourceBadge or GameStatusBadge — rendered next to the name */
  badge?: ReactNode
  className?: string
}

// Floats over the hero's bottom edge — name, one line of context, avatar.
// Entity names render large and bold everywhere (brand guide: "Entity names:
// large, confident, bold"), never re-styled per screen.
export function IdentityOverlay({ name, subtitle, avatarUri, badge }: IdentityOverlayProps) {
  return (
    <View className="flex-row items-end gap-md p-lg">
      <Avatar uri={avatarUri} fallback={name} size="lg" />
      <View className="flex-1 gap-xs">
        <View className="flex-row items-center gap-sm flex-wrap">
          <Text variant="entityName" className="text-white">{name}</Text>
          {badge}
        </View>
        {subtitle ? <Text className="text-white/80">{subtitle}</Text> : null}
      </View>
    </View>
  )
}
