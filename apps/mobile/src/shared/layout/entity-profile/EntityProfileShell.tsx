import { useRef, useState, type ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import type GorhomBottomSheet from '@gorhom/bottom-sheet'
import { Sheet, SheetScrollView } from '@/shared/ui/Sheet'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import { EntityHero, type EntityHeroProps } from './EntityHero'
import { IdentityOverlay, type IdentityOverlayProps } from './IdentityOverlay'
import { StatChipRail, type StatChipRailProps } from './StatChipRail'
import { EntityProfileTabs } from './EntityProfileTabs'

export interface EntityProfileShellProps {
  hero: Pick<EntityHeroProps, 'youtubeVideoId' | 'fallbackImageUri' | 'mediaItems' | 'onMediaPress'>
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
  /** e.g. useSportTheme(sport) — scopes --color-sport-accent to this screen. */
  style?: StyleProp<ViewStyle>
}

export function EntityProfileShell({ hero, identity, stats, tabs, activeTab, onTabChange, children, highlights, onShare, style }: EntityProfileShellProps) {
  const sheetRef = useRef<GorhomBottomSheet>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <View className="flex-1 bg-canvas" style={style}>
      <EntityHero {...hero} onShare={onShare}>
        <IdentityOverlay {...identity} />
        <StatChipRail stats={stats} tone="glass" />
      </EntityHero>

      <Sheet ref={sheetRef} onChange={(index) => setIsExpanded(index === 2)}>
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
}
