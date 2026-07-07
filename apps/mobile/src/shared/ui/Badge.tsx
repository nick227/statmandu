import { View } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import type { StatusColorToken } from '@/lib/theme'

const badgeVariants = cva('flex-row items-center self-start rounded-pill px-sm py-xs', {
  variants: {
    tone: {
      'muted-text': 'bg-muted-text/15',
      brand: 'bg-brand/15',
      verified: 'bg-verified/15',
      dispute: 'bg-dispute/15',
      live: 'bg-live/15',
      imported: 'bg-imported/15',
    } satisfies Record<StatusColorToken, string>,
  },
  defaultVariants: { tone: 'muted-text' },
})

const textToneClass: Record<StatusColorToken, string> = {
  'muted-text': 'text-muted-text',
  brand: 'text-brand',
  verified: 'text-verified',
  dispute: 'text-dispute',
  live: 'text-live',
  imported: 'text-imported',
}

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: string
  className?: string
}

export function Badge({ tone = 'muted-text', children, className }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ tone }), className)}>
      <Text className={cn('text-stat-label', textToneClass[tone as StatusColorToken])}>{children}</Text>
    </View>
  )
}
