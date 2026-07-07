import type { LucideIcon } from 'lucide-react-native'

export interface TabBarIconProps {
  icon: LucideIcon
  color: string
  size?: number
}

// Every tab bar icon renders through this so size/stroke stay consistent —
// screens never import lucide icons directly for nav chrome.
export function TabBarIcon({ icon: Icon, color, size = 24 }: TabBarIconProps) {
  return <Icon color={color} size={size} />
}
