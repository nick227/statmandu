import React from 'react'
import { View } from 'react-native'
import { AlertTriangle, Check } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'

export interface StudioAlertsProps {
  /** Conflict warning or mutation error message */
  conflictMessage: string | null
  /** Success feedback message after a release is published */
  publishSuccessMsg: string | null
}

/**
 * Renders warning, conflict, and publication notification banners.
 */
export function StudioAlerts({ conflictMessage, publishSuccessMsg }: StudioAlertsProps) {
  if (!conflictMessage && !publishSuccessMsg) {
    return null
  }

  return (
    <>
      {conflictMessage && (
        <View className="mb-md flex-row items-center gap-sm rounded-xl border border-warning/40 bg-warning/10 p-md">
          <AlertTriangle size={20} className="text-warning flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-warning">{conflictMessage}</Text>
          </View>
        </View>
      )}

      {publishSuccessMsg && (
        <View className="mb-md flex-row items-center gap-sm rounded-xl border border-success/40 bg-success/10 p-md">
          <Check size={20} className="text-success flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-success">{publishSuccessMsg}</Text>
          </View>
        </View>
      )}
    </>
  )
}
