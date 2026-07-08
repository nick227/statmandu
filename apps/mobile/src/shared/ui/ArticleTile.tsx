import type { ReactNode } from 'react'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'
import { cn } from '@/lib/utils'
import { SpotlightCard } from './SpotlightCard'

export interface ArticleTileProps extends PressableProps {
  title: string
  imageUri?: string | null
  /** Byline + relative date, e.g. "By Alice · 2d ago" */
  meta?: string | null
  /** First keyword, shown as the eyebrow — mirrors the reader screen's kicker. */
  kicker?: string | null
  /** e.g. a status Badge for an author's own non-published article — same
   *  slot SpotlightCard already exposes for athlete/game kinds. */
  badge?: ReactNode
  className?: string
  style?: StyleProp<ViewStyle>
}

// Thin domain wrapper around SpotlightCard's `article` kind — same relationship
// EntityTile.tsx has to `kind="athlete"`. Reused by the article grid on Explore
// and any "recent articles" rail, not just one screen.
export function ArticleTile({ title, imageUri, meta, kicker, badge, className, style, ...props }: ArticleTileProps) {
  return (
    <SpotlightCard
      size="small"
      kind="article"
      eyebrow={kicker ?? undefined}
      title={title}
      subtitle={meta ?? undefined}
      imageUri={imageUri}
      badge={badge}
      className={cn(className)}
      style={style}
      {...props}
    />
  )
}
