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
    <View className={className ?? 'items-center justify-center py-xxl px-lg gap-sm'}>
      <Icon size={32} color={mutedTextColor} />
      <Text className="font-semibold text-center">{title}</Text>
      {description ? <Text variant="caption" className="text-center">{description}</Text> : null}
    </View>
  )
}
