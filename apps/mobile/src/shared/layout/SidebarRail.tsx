import { useMemo, useState, type ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { cn } from '@/lib/utils'
import { brand } from '@/config/brand'
import { Text } from '@/shared/ui/Text'

export interface SidebarRailProps {
  children: ReactNode
  className?: string
}

export function SidebarRail({ children, className }: SidebarRailProps) {
  return <View className={cn('gap-md', className)}>{children}</View>
}

export interface SidebarBrandPanelProps {
  title?: string
  subtitle?: string
}

export function SidebarBrandPanel({
  title = brand.wordmark,
  subtitle = 'Scores, rankings, video, and verified stat lines.',
}: SidebarBrandPanelProps) {
  return (
    <View className="border-b-4 border-brand bg-surface p-md">
      <Text className="text-xl font-bold">{title}</Text>
      <Text variant="caption">{subtitle}</Text>
    </View>
  )
}

export interface SidebarPanelProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function SidebarPanel({ title, subtitle, children, className }: SidebarPanelProps) {
  return (
    <View className={cn('gap-sm border border-border bg-surface p-md', className)}>
      {title || subtitle ? (
        <View>
          {title ? <Text className="font-bold">{title}</Text> : null}
          {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  )
}

export interface SidebarHref {
  pathname: string
  params?: Record<string, string>
}

export function SidebarChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={active ? 'rounded-pill bg-sport-accent px-sm py-xs' : 'rounded-pill border border-border bg-surface px-sm py-xs'}
    >
      <Text variant="caption" className={active ? 'font-semibold text-white' : 'font-semibold'}>{label}</Text>
    </Pressable>
  )
}

export interface SidebarAdSlotProps {
  sponsoredLabel: string
  sponsor: string
  headline: string
  body?: string
  cta: string
  format?: 'banner' | 'card'
}

export function SidebarAdSlot({
  sponsoredLabel,
  sponsor,
  headline,
  body,
  cta,
  format = 'card',
}: SidebarAdSlotProps) {
  const isBanner = format === 'banner'
  return (
    <View
      className={
        isBanner
          ? 'min-h-[72px] justify-center border border-dashed border-border bg-surface px-md py-sm'
          : 'min-h-[120px] justify-between border border-dashed border-border bg-surface p-md'
      }
    >
      <View className="flex-row items-center justify-between gap-sm">
        <Text variant="statLabel" className="text-muted-text">{sponsoredLabel}</Text>
        <Text variant="caption" className="text-muted-text">{sponsor}</Text>
      </View>
      <View className={isBanner ? 'flex-row items-center justify-between gap-md pt-xs' : 'gap-xs pt-sm'}>
        <View className="flex-1 gap-xs">
          <Text className={isBanner ? 'font-semibold' : 'text-lg font-bold'} numberOfLines={isBanner ? 1 : 2}>
            {headline}
          </Text>
          {!isBanner && body ? <Text variant="caption" numberOfLines={2}>{body}</Text> : null}
        </View>
        <View className="rounded-pill border border-border bg-canvas px-sm py-xs">
          <Text variant="caption" className="font-semibold">{cta}</Text>
        </View>
      </View>
    </View>
  )
}

export function SidebarGlanceRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-t border-border pt-sm">
      <Text variant="statLabel">{label}</Text>
      <Text className="font-semibold">{value}</Text>
    </View>
  )
}

export function SidebarActionRow({
  title,
  meta,
  href,
}: {
  title: string
  meta?: string
  href: SidebarHref
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable className="border-t border-border pt-sm active:opacity-70">
        <Text className="font-semibold">{title}</Text>
        {meta ? <Text variant="caption">{meta}</Text> : null}
      </Pressable>
    </Link>
  )
}
