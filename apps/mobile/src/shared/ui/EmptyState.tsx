import { View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useNativeColor } from '@/lib/theme'
import { Text } from './Text'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  const mutedTextColor = useNativeColor('mutedText')
  return (
    <View className={className ?? 'min-h-56 items-center justify-center px-lg py-xxl gap-sm'}>
      <Icon size={24} color={mutedTextColor} />
      <Text accessibilityRole="header" className="font-semibold text-center" numberOfLines={2}>{title}</Text>
      {description ? <Text variant="caption" className="max-w-sm text-center" numberOfLines={3}>{description}</Text> : null}
    </View>
  )
}
