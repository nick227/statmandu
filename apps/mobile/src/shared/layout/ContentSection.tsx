import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'

export interface ContentSectionProps {
  title: string
  subtitle?: string
  href?: { pathname: string; params?: Record<string, string> }
  linkLabel?: string
  children?: ReactNode
  className?: string
}

export function ContentSection({ title, subtitle, href, linkLabel = 'See all', children, className }: ContentSectionProps) {
  return (
    <View className={className ?? 'gap-md'}>
      <View className="min-h-11 flex-row items-center justify-between gap-md">
        <View className="flex-1 gap-xs">
          <Text accessibilityRole="header" className="text-lg font-semibold" numberOfLines={2}>{title}</Text>
          {subtitle ? <Text variant="caption" numberOfLines={2}>{subtitle}</Text> : null}
        </View>
        {href ? (
          <Link href={href as never} className="min-h-11 justify-center py-sm">
            <Text variant="caption" className="text-brand font-semibold" numberOfLines={1}>{linkLabel}</Text>
          </Link>
        ) : null}
      </View>
      {children}
    </View>
  )
}
