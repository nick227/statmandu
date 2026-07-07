import { Input, type InputProps } from './Input'

export function Textarea({ className, ...props }: InputProps) {
  return (
    <Input
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      className={className}
      style={{ minHeight: 96 }}
      {...props}
    />
  )
}
