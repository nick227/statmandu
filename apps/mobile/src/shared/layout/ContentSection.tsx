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
    <View className={className ?? 'gap-sm'}>
      <View className="flex-row items-end justify-between gap-md">
        <View className="flex-1 gap-xs">
          <Text className="text-lg font-semibold">{title}</Text>
          {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
        </View>
        {href ? (
          <Link href={href as never}>
            <Text variant="caption" className="text-brand font-semibold">{linkLabel}</Text>
          </Link>
        ) : null}
      </View>
      {children}
    </View>
  )
}
