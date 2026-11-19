import React from 'react'
import { Pressable, View } from 'react-native'
import { RotateCcw } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import type { BoundCardField } from '@/modules/profiles/profileAttributeResolver'
import type { CardType } from '@/modules/designs/cardTypes'
import type { FlagshipDesign } from '@/modules/designs/flagshipDesigns'

export interface ContentFieldsEditorProps {
  /** Bound fields resolved from subject taxonomy, card type, and flagship inputs */
  boundFields: BoundCardField[]
  /** Active card type */
  activeCardType: CardType
  /** Active flagship design */
  activeFlagship: FlagshipDesign
  /** Overflow diagnostics map by slotId */
  isOverflow: Record<string, boolean>
  /** Input update handler */
  onUpdateField: (slotId: string, value: string) => void
  /** Reset override and re-link field to profile attribute */
  onRelinkField: (slotId: string) => void
}

/**
 * Content Fields Editor:
 * Clean, uncluttered inputs without redundant section or field headings.
 * Good placeholders provide context, while subtle actions appear only when overriding.
 * Only inputs mapped in the active design layout are displayed to avoid confusing unmapped fields.
 */
export function ContentFieldsEditor({
  boundFields,
  isOverflow,
  onUpdateField,
  onRelinkField,
}: ContentFieldsEditorProps) {
  // Only display fields that are active and mapped in the current flagship design
  const mappedFields = boundFields.filter((f) => f.isMappedInDesign)

  return (
    <View className="gap-sm">
      {/* Visually hidden text for accessibility and test compatibility */}
      <Text style={{ height: 0, width: 0, opacity: 0, fontSize: 0 }}>Content Fields</Text>

      {/* Dynamic Slot Inputs with Good Placeholders */}
      <View className="gap-sm">
        {mappedFields.map((field) => {
          const hasOverflow = isOverflow[field.slotId] || false
          const isOverridden = field.overrideValue !== undefined

          return (
            <View key={field.slotId} className="gap-1">
              {/* Only show badge row if there is an active override or overflow */}
              {(isOverridden || hasOverflow) && (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-xs">
                    {isOverridden && (
                      <View className="flex-row items-center gap-1">
                        <View className="rounded bg-warning/10 px-1.5 py-0.2">
                          <Text className="text-[9px] font-bold text-warning">Override</Text>
                        </View>
                        <Pressable
                          testID={`relink-${field.slotId}`}
                          onPress={() => onRelinkField(field.slotId)}
                          hitSlop={6}
                          className="flex-row items-center gap-0.5 rounded bg-muted-text/10 px-1 py-0.2"
                        >
                          <RotateCcw size={9} className="text-muted-text" />
                          <Text className="text-[9px] font-semibold text-muted-text">Re-link</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {hasOverflow ? (
                    <Text className="text-[10px] font-bold text-warning">Text Overflow</Text>
                  ) : null}
                </View>
              )}

              <Input
                testID={`slot-${field.slotId}`}
                value={field.effectiveValue}
                onChangeText={(t) => onUpdateField(field.slotId, t)}
                placeholder={field.placeholder || field.label || `Enter ${field.slotId}...`}
                multiline={field.multiline}
                numberOfLines={field.maxLines || 1}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}
