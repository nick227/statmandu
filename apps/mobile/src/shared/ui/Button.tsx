import { Pressable, View, type PressableProps, ActivityIndicator } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useNativeColor, motion } from '@/lib/theme'
import { Text } from './Text'
import { UI } from '@/shared/layout/layoutConstants'

const buttonVariants = cva('flex-row items-center justify-center rounded-md active:opacity-70', {
  variants: {
    variant: {
      primary: 'bg-brand',
      secondary: 'bg-surface border border-border',
      ghost: 'bg-transparent',
      destructive: 'bg-live',
    },
    size: {
      sm: 'h-9 px-sm',
      md: 'h-11 px-md',
      lg: 'h-[52px] px-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

const textVariants = cva('font-semibold', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-text',
      ghost: 'text-brand',
      destructive: 'text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps extends Omit<PressableProps, 'children'>, VariantProps<typeof buttonVariants> {
  className?: string
  children: string
  isLoading?: boolean
  icon?: LucideIcon
  iconPosition?: 'start' | 'end'
}

export function Button({ variant, size, className, children, isLoading, disabled, icon: Icon, iconPosition = 'start', onPressIn, onPressOut, ...props }: ButtonProps) {
  const brandColor = useNativeColor('brand')
  const textColor = useNativeColor('text')
  const iconColor = variant === 'secondary' ? textColor : variant === 'ghost' ? brandColor : '#FFFFFF'
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    // The box (background/border/rounding) lives on a plain Pressable so
    // NativeWind's className interop is guaranteed to apply — wrapping the
    // whole thing in Animated.createAnimatedComponent(Pressable) and putting
    // className AND an animated `style` on the same node silently drops the
    // className-driven background/border on web (Reanimated's web style
    // handling doesn't merge cleanly with NativeWind's here). The scale-press
    // animation instead applies to an inner Animated.View that carries only
    // `style`, never `className`, so there's nothing for it to conflict with.
    <Pressable
      className={cn(buttonVariants({ variant, size }), (disabled || isLoading) && 'opacity-50', className)}
      disabled={disabled || isLoading}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || isLoading), busy: Boolean(isLoading) }}
      onPressIn={(e) => {
        scale.value = withTiming(0.96, { duration: motion.cardPressMs })
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: motion.cardPressMs })
        onPressOut?.(e)
      }}
      {...props}
    >
      <Animated.View style={animatedStyle}>
        {isLoading ? (
          <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? brandColor : '#FFFFFF'} />
        ) : (
          <View className="flex-row items-center justify-center gap-sm">
            {Icon && iconPosition === 'start' ? <Icon size={UI.iconSize.sm} color={iconColor} /> : null}
            <Text className={textVariants({ variant, size })} numberOfLines={1}>{children}</Text>
            {Icon && iconPosition === 'end' ? <Icon size={UI.iconSize.sm} color={iconColor} /> : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}
