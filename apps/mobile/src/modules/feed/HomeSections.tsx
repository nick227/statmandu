import { View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { SpotlightCard } from '@/shared/ui/SpotlightCard'
import { ContentSection } from '@/shared/layout/ContentSection'
import { AdPlaceholder } from '@/modules/feed/AdPlaceholder'
import type { HomeAdSlot } from '@/modules/feed/homeContent'
import { SidebarBrandPanel, SidebarRail, SidebarSearchList, type SidebarListItem } from '@/shared/layout'

export { ContentSection as HomeSection }

export interface PlatformAuthorityBandProps {
  sportLabel: string
  headline: string
  subhead: string
  metrics: { label: string; value: string }[]
}

export function PlatformAuthorityBand({ sportLabel, headline, subhead, metrics }: PlatformAuthorityBandProps) {
  return (
    <View className="gap-sm border-b border-border bg-canvas pb-md">
      <View className="gap-xs border-l-4 border-sport-accent pl-md">
        <Text variant="statLabel" className="text-sport-accent">{sportLabel}</Text>
        <Text className="text-2xl font-bold">{headline}</Text>
        <Text variant="caption" numberOfLines={2}>{subhead}</Text>
      </View>
      <View className="flex-row flex-wrap gap-sm">
        {metrics.map((metric) => (
          <View key={metric.label} className="min-w-[30%] flex-1 border-r border-border bg-surface px-md py-sm">
            <Text variant="statValue" className="text-xl">{metric.value}</Text>
            <Text variant="statLabel">{metric.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export interface PlatformPitchCardProps {
  eyebrow: string
  title: string
  body: string
  proofPoints: string[]
  compact?: boolean
}

export function PlatformPitchCard({ eyebrow, title, body, proofPoints, compact }: PlatformPitchCardProps) {
  return (
    <View className={compact ? 'gap-sm rounded-lg border border-border bg-surface p-md' : 'gap-md rounded-lg border border-brand/20 bg-brand/5 p-lg'}>
      <Text variant="statLabel" className={compact ? 'text-muted-text' : 'text-brand'}>{eyebrow}</Text>
      <Text className={compact ? 'text-lg font-bold' : 'text-xl font-bold'}>{title}</Text>
      <Text variant={compact ? 'caption' : 'body'}>{body}</Text>
      {!compact ? (
        <View className="gap-xs">
          {proofPoints.map((point) => (
            <Text key={point} variant="caption">• {point}</Text>
          ))}
        </View>
      ) : null}
    </View>
  )
}

export interface UsageCta {
  id: string
  title: string
  description: string
  href: { pathname: string; params?: Record<string, string> }
  eyebrow?: string
}

export function UsageCtaRow({ ctas, defaultEyebrow = 'Get started' }: { ctas: UsageCta[]; defaultEyebrow?: string }) {
  return (
    <View className="gap-sm">
      {ctas.map((cta) => (
        <Link key={cta.id} href={cta.href as never} asChild>
          <SpotlightCard
            size="small"
            kind="activity"
            eyebrow={cta.eyebrow ?? defaultEyebrow}
            title={cta.title}
            subtitle={cta.description}
          />
        </Link>
      ))}
    </View>
  )
}

export function CommunityPulseMetrics({ metrics }: { metrics: { label: string; value: string }[] }) {
  return (
    <View className="flex-row gap-sm">
      {metrics.map((metric) => (
        <View key={metric.label} className="flex-1 rounded-md border border-border bg-surface px-sm py-md">
          <Text variant="statValue" className="text-lg">{metric.value}</Text>
          <Text variant="statLabel">{metric.label}</Text>
        </View>
      ))}
    </View>
  )
}

export type HomeSidebarItem = SidebarListItem & { section: 'Live' | 'Leaders' | 'Videos' }

export interface HomeSidebarProps {
  ad?: HomeAdSlot
  items: HomeSidebarItem[]
}

export function HomeSidebar({ ad, items }: HomeSidebarProps) {
  return (
    <SidebarRail>
      <SidebarBrandPanel />

      {ad ? <AdPlaceholder slot={ad} /> : null}

      <SidebarSearchList
        title="Freshest"
        subtitle="Filter the latest items on the board."
        items={items}
        filters={['All', 'Live', 'Leaders', 'Videos']}
      />
    </SidebarRail>
  )
}
