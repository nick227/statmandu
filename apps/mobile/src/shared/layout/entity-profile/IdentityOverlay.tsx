import { Pressable, View } from 'react-native'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import type { ReactNode } from 'react'

/** A plain line, or `{ text, onPress }` for a line that links to a canonical
 *  entity (e.g. the player's team) — IdentityOverlay still owns the weight
 *  styling either way, the caller only supplies text + an optional handler. */
export type MetaLine = string | { text: string; onPress: () => void } | null | undefined

export interface IdentityOverlayProps {
  name: string
  /** Ordered, most important first — e.g. for a player: [@username,
   *  hometown, "Guard · Eastside Ballers"]. Each line gets slightly less
   *  visual weight than the one before it, name always dominates. */
  metaLines?: MetaLine[]
  avatarUri?: string | null
  /** e.g. a SourceBadge or GameStatusBadge — rendered next to the name */
  badge?: ReactNode
  className?: string
}

// Floats over the hero's bottom edge — name, then a descending hierarchy of
// context lines, then avatar. Entity names render large and bold everywhere
// (brand guide: "Entity names: large, confident, bold"), never re-styled per
// screen; every line below it steps down in weight so the name never has to
// compete with anything for attention.
export function IdentityOverlay({ name, metaLines, avatarUri, badge }: IdentityOverlayProps) {
  const lines = (metaLines ?? []).filter((line): line is string | { text: string; onPress: () => void } => Boolean(line))

  return (
    <View className="gap-md p-lg pb-xl">
      <Avatar uri={avatarUri} fallback={name} size="lg" className="border-2 border-white/60" />
      <View className="flex-1 gap-xs">
        <View className="flex-row items-center gap-sm flex-wrap">
          <Text variant="entityName" className="text-white" numberOfLines={2}>{name}</Text>
          {badge}
        </View>
        {lines.map((line, i) => {
          const text = typeof line === 'string' ? line : line.text
          const onPress = typeof line === 'string' ? undefined : line.onPress
          const textEl = (
            <Text numberOfLines={1} className={i === 0 ? 'text-white/90 font-semibold' : 'text-white/65 text-sm'}>
              {text}
            </Text>
          )
          return onPress ? (
            <Pressable key={text} onPress={onPress} hitSlop={4}>
              {textEl}
            </Pressable>
          ) : (
            <View key={text}>{textEl}</View>
          )
        })}
      </View>
    </View>
  )
}
