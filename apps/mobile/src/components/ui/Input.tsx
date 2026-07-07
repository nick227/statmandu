import { TextInput, type TextInputProps } from 'react-native'
import { cn } from '@/lib/utils'

export interface InputProps extends TextInputProps {
  className?: string
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        'rounded-md border border-border bg-surface px-md py-sm text-body text-text',
        className
      )}
      placeholderTextColor="rgb(107 114 128)"
      {...props}
    />
  )
}
