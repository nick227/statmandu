import React from 'react'
import { Pressable, View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import type { StudioPanelLocation, StudioBreadcrumb } from '../types/panelNavigation'

export interface StudioPanelHeaderProps {
  location: StudioPanelLocation
  breadcrumbs: StudioBreadcrumb[]
  title: string
  onBack: () => void
  onNavigate: (loc: StudioPanelLocation) => void
}

export function StudioPanelHeader({
  location,
  breadcrumbs,
  title,
  onBack,
  onNavigate,
}: StudioPanelHeaderProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  if (location.level === 1) {
    return null
  }

  return (
    <View className="border-b border-border/60 pb-3 mb-2 gap-2">
      {/* Breadcrumb Trail */}
      <View className="flex-row items-center flex-wrap gap-1">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              {idx > 0 && (
                <ChevronRight size={12} color={mutedColor} />
              )}
              <Pressable
                testID={`breadcrumb-${crumb.label.toLowerCase()}`}
                onPress={() => onNavigate(crumb.location)}
                disabled={isLast}
                className="py-0.5 active:opacity-60"
                accessibilityRole="button"
                accessibilityLabel={`Navigate to ${crumb.label}`}
              >
                <Text
                  className={
                    isLast
                      ? 'text-xs font-bold text-text'
                      : 'text-xs font-medium text-muted-text hover:text-text'
                  }
                >
                  {crumb.label}
                </Text>
              </Pressable>
            </React.Fragment>
          )
        })}
      </View>

      {/* Back button and current title */}
      <View className="flex-row items-center gap-2">
        <Pressable
          testID="panel-back-button"
          onPress={onBack}
          className="h-8 w-8 rounded-lg bg-surface border border-border items-center justify-center active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={16} color={brandColor} />
        </Pressable>
        <Text className="text-base font-extrabold tracking-tight text-text flex-1">
          {title}
        </Text>
      </View>
    </View>
  )
}
