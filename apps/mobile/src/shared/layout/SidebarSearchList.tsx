import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Input } from '@/shared/ui/Input'
import { Text } from '@/shared/ui/Text'
import { SidebarChip, SidebarPanel, type SidebarHref } from './SidebarRail'

export interface SidebarListItem {
  id: string
  title: string
  meta?: string
  section: string
  href?: SidebarHref
}

export interface SidebarSearchListProps {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  items: SidebarListItem[]
  filters?: readonly string[]
  maxItems?: number
}

export function SidebarSearchList({
  title,
  subtitle,
  searchPlaceholder = 'Search latest',
  items,
  filters,
  maxItems = 8,
}: SidebarSearchListProps) {
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<string>('All')
  const resolvedFilters = filters ?? ['All', ...Array.from(new Set(items.map((item) => item.section)))]
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items
      .filter((item) => section === 'All' || item.section === section)
      .filter((item) => !normalized || `${item.title} ${item.meta ?? ''}`.toLowerCase().includes(normalized))
      .slice(0, maxItems)
  }, [items, maxItems, query, section])

  return (
    <SidebarPanel title={title} subtitle={subtitle}>
      <Input value={query} onChangeText={setQuery} placeholder={searchPlaceholder} />
      <View className="flex-row flex-wrap gap-xs">
        {resolvedFilters.map((value) => (
          <SidebarChip key={value} label={value} active={section === value} onPress={() => setSection(value)} />
        ))}
      </View>
      <View className="gap-xs">
        {filteredItems.map((item) => (
          <SidebarListRow key={item.id} item={item} />
        ))}
        {filteredItems.length === 0 ? <Text variant="caption">No matches yet.</Text> : null}
      </View>
    </SidebarPanel>
  )
}

export function SidebarListRow({ item }: { item: SidebarListItem }) {
  const body = (
    <View className="border-t border-border pt-sm">
      <Text variant="statLabel" className="text-sport-accent">{item.section}</Text>
      <Text className="font-semibold" numberOfLines={2}>{item.title}</Text>
      {item.meta ? <Text variant="caption" numberOfLines={1}>{item.meta}</Text> : null}
    </View>
  )

  if (!item.href) return body
  return (
    <Link href={item.href as never} asChild>
      <Pressable className="active:opacity-70">{body}</Pressable>
    </Link>
  )
}
