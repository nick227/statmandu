import { Pressable, type PressableProps, ActivityIndicator } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
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

export function Button({ variant, size, className, children, isLoading, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), (disabled || isLoading) && 'opacity-50', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#1D4ED8' : '#FFFFFF'} />
      ) : (
        <Text className={textVariants({ variant, size })}>{children}</Text>
      )}
    </Pressable>
  )
}
