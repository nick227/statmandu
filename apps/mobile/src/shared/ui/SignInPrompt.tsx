import { Pressable } from 'react-native'
import { Link } from 'expo-router'
import { Text } from './Text'

export interface SignInPromptProps {
  message: string
  className?: string
}

// Shown in place of a gated screen/widget for a logged-out visitor — never
// a hard redirect, since these live inside otherwise-public browsing
// screens (or tabs reachable from the bar) where a surprise nav jump would
// be jarring. `className` controls layout: full-screen centered for a
// gated screen, a compact inline row for an embedded widget.
export function SignInPrompt({ message, className }: SignInPromptProps) {
  return (
    <Link href="/login" asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={message}
        className={className ?? 'min-h-11 items-center justify-center rounded-md border border-border bg-surface px-md py-sm'}
      >
        <Text variant="caption" className="text-brand text-center font-semibold">{message}</Text>
      </Pressable>
    </Link>
  )
}
