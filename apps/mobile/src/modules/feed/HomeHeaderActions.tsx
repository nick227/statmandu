import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Search, User } from 'lucide-react-native'
import { useNativeColor } from '@/lib/theme'

function ChromeIconButton({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Search
  label: string
}) {
  const color = useNativeColor('text')
  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityLabel={label}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
      >
        <Icon size={18} color={color} />
      </Pressable>
    </Link>
  )
}

/** Replaces the old tab bar: Search (Explore) + Me stay one tap from Home. */
export function HomeHeaderActions() {
  return (
    <View className="flex-row items-center gap-sm">
      <ChromeIconButton href="/explore" icon={Search} label="Search and rankings" />
      <ChromeIconButton href="/me" icon={User} label="Account" />
    </View>
  )
}
