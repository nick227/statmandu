import { useRef, useState, type ReactNode } from 'react'
import { Platform, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native'
import type GorhomBottomSheet from '@gorhom/bottom-sheet'
import { Sheet, SheetScrollView } from '@/shared/ui/Sheet'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import { LAYOUT } from '../layoutConstants'
import { WideSidebarColumn } from '../WideSidebarColumn'
import { EntityHero, type EntityHeroProps } from './EntityHero'
import { IdentityOverlay, type IdentityOverlayProps } from './IdentityOverlay'
import { StatChipRail, type StatChipRailProps } from './StatChipRail'
import { EntityProfileTabs } from './EntityProfileTabs'

export interface EntityProfileShellProps {
  hero: Pick<EntityHeroProps, 'youtubeVideoId' | 'fallbackImageUri' | 'mediaItems' | 'onMediaPress' | 'height' | 'scrimHeight'>
  identity: IdentityOverlayProps
  stats: StatChipRailProps['stats']
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: ReactNode
  /** Rendered between the hero and the tabs — e.g. a "Last Game" /
   *  "Season High" highlights strip. Optional; generic (no domain content
   *  lives here, callers pass their own composed section). */
  highlights?: ReactNode
  /** Renders a share button in the hero when provided. */
  onShare?: () => void
  /** Route-aware rail. Shown only at `LAYOUT.wideBreakpoint`+ so the
   *  mobile sheet interaction stays full-bleed. */
  sidebar?: ReactNode
  /** e.g. useSportTheme(sport) — scopes --color-sport-accent to this screen. */
  style?: StyleProp<ViewStyle>
}

export function EntityProfileShell({
  hero,
  identity,
  stats,
  tabs,
  activeTab,
  onTabChange,
  children,
  highlights,
  onShare,
  sidebar,
  style,
}: EntityProfileShellProps) {
  const sheetRef = useRef<GorhomBottomSheet>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const { width } = useWindowDimensions()
  const showSidebar = Boolean(sidebar) && width >= LAYOUT.wideBreakpoint
  const initialSnap = Platform.OS === 'web' ? 'half' : 'collapsed'

  const profile = (
    <View className="flex-1 bg-canvas">
      <EntityHero {...hero} onShare={onShare}>
        <IdentityOverlay {...identity} />
        <StatChipRail stats={stats} tone="glass" />
      </EntityHero>

      <Sheet ref={sheetRef} initialSnap={initialSnap} onChange={(index) => setIsExpanded(index === 2)}>
        {isExpanded ? (
          <View className="flex-row items-center gap-sm px-lg pb-sm">
            <Avatar uri={identity.avatarUri} fallback={identity.name} size="sm" />
            <Text className="font-semibold">{identity.name}</Text>
          </View>
        ) : null}
        {highlights}
        <EntityProfileTabs tabs={tabs} active={activeTab} onChange={onTabChange} />
        <SheetScrollView contentContainerClassName="pb-xxl">{children}</SheetScrollView>
      </Sheet>
    </View>
  )

  if (!showSidebar) {
    return (
      <View className="flex-1 bg-canvas" style={style}>
        {profile}
      </View>
    )
  }

  return (
    <View className="flex-1 flex-row bg-canvas" style={style}>
      <View className="flex-1">{profile}</View>
      <WideSidebarColumn>{sidebar}</WideSidebarColumn>
    </View>
  )
}
