import { View, Image } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from './Text'

const avatarVariants = cva('rounded-full overflow-hidden bg-muted-text/20 items-center justify-center', {
  variants: {
    size: {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-20 h-20',
      xl: 'w-32 h-32',
    },
  },
  defaultVariants: { size: 'md' },
})

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  uri?: string | null
  fallback: string
  className?: string
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ uri, fallback, size, className }: AvatarProps) {
  return (
    <View className={cn(avatarVariants({ size }), className)}>
      {uri ? (
        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <Text className="text-muted-text font-semibold">{initialsOf(fallback)}</Text>
      )}
    </View>
  )
}
