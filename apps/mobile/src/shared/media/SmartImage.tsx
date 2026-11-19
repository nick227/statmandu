import { imageAuthHeaders } from '@/lib/sdk'
import { useState } from 'react'
import { View } from 'react-native'
import { Image, type ImageProps } from 'expo-image'
import { cssInterop } from 'nativewind'
import { cn } from '@/lib/utils'

cssInterop(Image, { className: 'style' })

export interface SmartImageProps extends Omit<ImageProps, 'source' | 'contentFit' | 'onError' | 'resizeMode'> {
  uri?: string | null
  fallback?: React.ReactNode
  className?: string
  /** Compatibility with the former React Native Image wrapper. */
  resizeMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  onError?: ImageProps['onError']
}

export function SmartImage({ uri, fallback, className, resizeMode = 'cover', onError, ...props }: SmartImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null)

  if (!uri || failedUri === uri) {
    return <View className={cn('items-center justify-center bg-muted-text/15', className)}>{fallback}</View>
  }

  return (
    <Image
      source={{ uri, headers: imageAuthHeaders(uri) }}
      className={className}
      contentFit={resizeMode}
      cachePolicy={uri.includes('/uploads/images/') ? 'none' : 'memory-disk'}
      transition={180}
      recyclingKey={uri}
      onError={(event) => {
        setFailedUri(uri)
        onError?.(event)
      }}
      {...props}
    />
  )
}
