import { Pressable, type PressableProps, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useNativeColor, motion } from '@/lib/theme'
import { Text } from './Text'

const buttonVariants = cva('flex-row items-center justify-center rounded-md active:opacity-70', {
  variants: {
    variant: {
      primary: 'bg-brand',
      secondary: 'bg-surface border border-border',
      ghost: 'bg-transparent',
      destructive: 'bg-live',
    },
    size: {
      sm: 'px-sm py-xs',
      md: 'px-md py-sm',
      lg: 'px-lg py-md',
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
}

export function Button({ variant, size, className, children, isLoading, disabled, onPressIn, onPressOut, ...props }: ButtonProps) {
  const brandColor = useNativeColor('brand')
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
          <Text className={textVariants({ variant, size })}>{children}</Text>
        )}
      </Animated.View>
    </Pressable>
  )
}
