import { SidebarAdSlot } from '@/shared/layout'
import type { HomeAdSlot } from '@/modules/feed/homeContent'

export function AdPlaceholder({ slot }: { slot: HomeAdSlot }) {
  return (
    <SidebarAdSlot
      sponsoredLabel={slot.sponsoredLabel}
      sponsor={slot.sponsor}
      headline={slot.headline}
      body={slot.body}
      cta={slot.cta}
      format={slot.format}
    />
  )
}
