import { TextInput, type TextInputProps } from 'react-native'
import { cn } from '@/lib/utils'
import { useNativeColor } from '@/lib/theme'

export interface InputProps extends TextInputProps {
  className?: string
}

export function Input({ className, ...props }: InputProps) {
  const mutedTextColor = useNativeColor('mutedText')
  return (
    <TextInput
      className={cn(
        'rounded-md border border-border bg-surface px-md py-sm text-body text-text',
        className
      )}
      placeholderTextColor={mutedTextColor}
      {...props}
    />
  )
}
