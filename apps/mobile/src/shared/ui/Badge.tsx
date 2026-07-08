import { View } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from './Text'
import { useStatusNativeColor, type StatusColorToken } from '@/lib/theme'

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
  /** Reserve for the statuses that genuinely warrant more visual weight
   *  (e.g. verified, disputed) — brand guide: badges are "visually minimal,
   *  not a warning banner," so most tones should stay icon-free. */
  icon?: React.ComponentType<{ size?: number; color?: string }>
  className?: string
}

function BadgeIcon({ icon: Icon, tone }: { icon: NonNullable<BadgeProps['icon']>; tone: StatusColorToken }) {
  const iconColor = useStatusNativeColor(tone)
  return <Icon size={11} color={iconColor} />
}

export function Badge({ tone = 'muted-text', children, icon: Icon, className }: BadgeProps) {
  const resolvedTone = (tone ?? 'muted-text') as StatusColorToken
  return (
    <View className={cn(badgeVariants({ tone }), 'gap-xs', className)}>
      {Icon ? <BadgeIcon icon={Icon} tone={resolvedTone} /> : null}
      <Text className={cn('text-stat-label', textToneClass[resolvedTone])}>{children}</Text>
    </View>
  )
}
