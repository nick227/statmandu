import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { SpotlightCard } from '@/shared/ui/SpotlightCard'

export interface HomeSectionProps {
  title: string
  subtitle?: string
  href?: { pathname: string; params?: Record<string, string> }
  linkLabel?: string
  children: ReactNode
  className?: string
}

export function HomeSection({ title, subtitle, href, linkLabel = 'See all', children, className }: HomeSectionProps) {
  return (
    <View className={className ?? 'gap-sm'}>
      <View className="flex-row items-end justify-between gap-md">
        <View className="flex-1 gap-xs">
          <Text className="text-lg font-semibold">{title}</Text>
          {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
        </View>
        {href ? (
          <Link href={href as never}>
            <Text variant="caption" className="text-brand font-semibold">{linkLabel}</Text>
          </Link>
        ) : null}
      </View>
      {children}
    </View>
  )
}

export interface PlatformAuthorityBandProps {
  sportLabel: string
  headline: string
  subhead: string
  metrics: { label: string; value: string }[]
}

export function PlatformAuthorityBand({ sportLabel, headline, subhead, metrics }: PlatformAuthorityBandProps) {
  return (
    <View className="gap-md rounded-lg border border-border bg-surface p-lg">
      <View className="gap-xs">
        <Text variant="statLabel" className="text-sport-accent">{sportLabel}</Text>
        <Text variant="entityName" className="text-2xl">{headline}</Text>
        <Text variant="caption">{subhead}</Text>
      </View>
      <View className="flex-row flex-wrap gap-sm">
        {metrics.map((metric) => (
          <View key={metric.label} className="min-w-[30%] flex-1 rounded-md bg-canvas px-md py-sm">
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
}

export function PlatformPitchCard({ eyebrow, title, body, proofPoints }: PlatformPitchCardProps) {
  return (
    <View className="gap-md rounded-lg border border-brand/20 bg-brand/5 p-lg">
      <Text variant="statLabel" className="text-brand">{eyebrow}</Text>
      <Text className="text-xl font-bold">{title}</Text>
      <Text variant="body">{body}</Text>
      <View className="gap-xs">
        {proofPoints.map((point) => (
          <Text key={point} variant="caption">• {point}</Text>
        ))}
      </View>
    </View>
  )
}

export interface UsageCta {
  id: string
  title: string
  description: string
  href: { pathname: string; params?: Record<string, string> }
}

export function UsageCtaRow({ ctas }: { ctas: UsageCta[] }) {
  return (
    <View className="gap-sm">
      {ctas.map((cta) => (
        <Link key={cta.id} href={cta.href as never} asChild>
          <SpotlightCard
            size="small"
            kind="activity"
            eyebrow="Get started"
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
