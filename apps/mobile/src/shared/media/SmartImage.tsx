import { Image, View, type ImageProps } from 'react-native'
import { cn } from '@/lib/utils'

export interface SmartImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null
  fallback?: React.ReactNode
  className?: string
}

export function SmartImage({ uri, fallback, className, ...props }: SmartImageProps) {
  if (!uri) {
    return <View className={cn('items-center justify-center bg-muted-text/15', className)}>{fallback}</View>
  }

  return <Image source={{ uri }} className={className} {...props} />
}
