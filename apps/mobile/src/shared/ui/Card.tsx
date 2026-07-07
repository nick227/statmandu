import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils'

export interface CardProps extends ViewProps {
  className?: string
}

// Large cards, strong separation, no heavy borders — per brand guide's UI language.
export function Card({ className, ...props }: CardProps) {
  return <View className={cn('rounded-lg bg-surface border border-border', className)} {...props} />
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View className={cn('p-lg pb-sm', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <View className={cn('p-lg pt-sm', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <View className={cn('p-lg pt-sm flex-row items-center', className)} {...props} />
}
