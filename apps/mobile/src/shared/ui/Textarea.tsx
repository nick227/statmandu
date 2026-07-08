import { Input, type InputProps } from './Input'
import { cn } from '@/lib/utils'

export interface TextareaProps extends InputProps {
  /** `lg` is sized/typeset for paragraphs of prose (Article body) rather
   *  than a short note — taller minimum height, `article-body` line-height
   *  instead of `body`. Default `md` is unchanged from before this prop
   *  existed (dispute notes, bios, claim verification notes). */
  size?: 'md' | 'lg'
}

export function Textarea({ className, size = 'md', ...props }: TextareaProps) {
  return (
    <Input
      multiline
      numberOfLines={size === 'lg' ? 14 : 4}
      textAlignVertical="top"
      className={cn(size === 'lg' && 'text-article-body', className)}
      style={{ minHeight: size === 'lg' ? 280 : 96 }}
      {...props}
    />
  )
}
