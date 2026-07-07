import { useRef, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import type GorhomBottomSheet from '@gorhom/bottom-sheet'
import { Sheet, SheetScrollView } from '@/shared/ui/Sheet'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import { EntityHero, type EntityHeroProps } from './EntityHero'
import { IdentityOverlay, type IdentityOverlayProps } from './IdentityOverlay'
import { StatChipRail, type StatChipRailProps } from './StatChipRail'
import { EntityProfileTabs } from './EntityProfileTabs'

export interface EntityProfileShellProps {
  hero: Pick<EntityHeroProps, 'youtubeVideoId' | 'fallbackImageUri'>
  identity: IdentityOverlayProps
  stats: StatChipRailProps['stats']
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: ReactNode
}

export function EntityProfileShell({ hero, identity, stats, tabs, activeTab, onTabChange, children }: EntityProfileShellProps) {
  const sheetRef = useRef<GorhomBottomSheet>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <View className="flex-1 bg-canvas">
      <EntityHero {...hero}>
        <IdentityOverlay {...identity} />
      </EntityHero>
      <StatChipRail stats={stats} />

      <Sheet ref={sheetRef} onChange={(index) => setIsExpanded(index === 2)}>
        {isExpanded ? (
          <View className="flex-row items-center gap-sm px-lg pb-sm">
            <Avatar uri={identity.avatarUri} fallback={identity.name} size="sm" />
            <Text className="font-semibold">{identity.name}</Text>
          </View>
        ) : null}
        <EntityProfileTabs tabs={tabs} active={activeTab} onChange={onTabChange} />
        <SheetScrollView contentContainerClassName="pb-xxl">{children}</SheetScrollView>
      </Sheet>
    </View>
  )
}
