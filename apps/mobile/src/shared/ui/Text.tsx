import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Typography variants — statman_project_docs/statman_docs_bundle/19_DESIGN_TOKEN_SHEET.json.
// Every screen should render text through this instead of bare RN <Text>, so
// the four brand type scales (entity name, stat value, stat label, body)
// stay consistent everywhere instead of drifting per-screen.
const textVariants = cva('text-text', {
  variants: {
    variant: {
      entityName: 'text-entity-name',
      statValue: 'text-stat-value',
      statLabel: 'text-stat-label uppercase text-muted-text',
      body: 'text-body',
      caption: 'text-sm text-muted-text',
      kicker: 'text-kicker uppercase text-sport-accent',
      articleTitle: 'text-article-title',
      articleDek: 'text-article-dek text-muted-text',
      articleBody: 'text-article-body',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  className?: string
}

export function Text({ variant, className, ...props }: TextProps) {
  return <RNText className={cn(textVariants({ variant }), className)} {...props} />
}
