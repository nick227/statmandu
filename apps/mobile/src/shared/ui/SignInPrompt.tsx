import { Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Text } from './Text'
import { cn } from '@/lib/utils'

export interface SignInPromptProps {
  message: string
  className?: string
  variant?: 'primary' | 'outline'
}

// Shown in place of a gated screen/widget for a logged-out visitor — never
// a hard redirect, since these live inside otherwise-public browsing
// screens (or tabs reachable from the bar) where a surprise nav jump would
// be jarring. `className` controls layout: full-screen centered for a
// gated screen, a compact inline row for an embedded widget.
export function SignInPrompt({ message, className, variant = 'outline' }: SignInPromptProps) {
  const isPrimary = variant === 'primary'

  return (
    <Link href="/login" asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={message}
        className={cn(
          'min-h-11 items-center justify-center rounded-xl px-md py-sm transition-all active:opacity-80',
          isPrimary
            ? 'bg-brand text-surface shadow-xs hover:bg-brand/90'
            : 'border border-border bg-surface hover:border-brand/40',
          className,
        )}
      >
        <Text
          variant="caption"
          className={cn(
            'text-center font-bold text-sm',
            isPrimary ? 'text-surface' : 'text-brand font-semibold',
          )}
        >
          {message}
        </Text>
      </Pressable>
    </Link>
  )
}
