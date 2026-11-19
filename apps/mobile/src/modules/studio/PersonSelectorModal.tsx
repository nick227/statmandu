import React, { useState } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import type { PersonProfile } from './hooks/usePersonSelector'
import { usePersonSelector } from './hooks/usePersonSelector'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Search, UserPlus, Check, X } from 'lucide-react-native'

export type { PersonProfile }

export interface PersonSelectorModalProps {
  visible: boolean
  selectedPersonId?: string | null
  onSelect: (person: PersonProfile) => void
  onClose: () => void
}

export function PersonSelectorModal({
  visible,
  selectedPersonId,
  onSelect,
  onClose,
}: PersonSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newBio, setNewBio] = useState('')

  const { people, isLoading: _isLoading, createPerson, isCreating: isPending } = usePersonSelector(searchQuery)

  async function handleCreatePerson() {
    if (!newDisplayName.trim()) return
    const created = await createPerson({
      displayName: newDisplayName.trim(),
      bio: newBio.trim() || undefined,
    })
    setIsCreating(false)
    setNewDisplayName('')
    setNewBio('')
    onSelect(created.data)
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="max-h-[85%] rounded-t-3xl border-t border-border bg-surface p-lg">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-md">
            <View>
              <Text className="text-xl font-bold">Select Card Subject</Text>
              <Text variant="caption">Choose an existing person or add someone new</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              className="rounded-full p-xs hover:bg-muted-text/10"
            >
              <X size={22} className="text-muted-text" />
            </Pressable>
          </View>

          {!isCreating ? (
            <>
              {/* Search Bar */}
              <View className="flex-row items-center gap-sm pb-md">
                <View className="flex-1">
                  <Input
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search people by name..."
                    autoCapitalize="none"
                  />
                </View>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={UserPlus}
                  onPress={() => setIsCreating(true)}
                >
                  New
                </Button>
              </View>

              {/* People list */}
              <ScrollView className="max-h-96 gap-xs">
                {people.length === 0 ? (
                  <View className="items-center py-xl">
                    <Text className="text-muted-text">
                      {searchQuery ? 'No matching people found' : 'No people available'}
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-sm"
                      onPress={() => setIsCreating(true)}
                    >
                      {`Create "${searchQuery || 'New Person'}"`}
                    </Button>
                  </View>
                ) : (
                  people.map((person) => {
                    const isSelected = person.id === selectedPersonId
                    return (
                      <Pressable
                        key={person.id}
                        accessibilityRole="button"
                        accessibilityLabel={person.displayName}
                        onPress={() => {
                          onSelect(person)
                          onClose()
                        }}
                        className={`flex-row items-center justify-between rounded-xl border p-md ${
                          isSelected
                            ? 'border-brand bg-brand/10'
                            : 'border-border bg-card-surface active:bg-muted-text/5'
                        }`}
                      >
                        <View className="flex-1">
                          <Text className="font-semibold text-text">{person.displayName}</Text>
                          {person.bio ? (
                            <Text variant="caption" numberOfLines={1}>
                              {person.bio}
                            </Text>
                          ) : null}
                        </View>
                        {isSelected && <Check size={18} className="text-brand" />}
                      </Pressable>
                    )
                  })
                )}
              </ScrollView>
            </>
          ) : (
            /* Quick Create Person Form */
            <View className="gap-md py-sm">
              <View className="gap-xs">
                <Text className="font-semibold text-text">Full / Display Name *</Text>
                <Input
                  value={newDisplayName}
                  onChangeText={setNewDisplayName}
                  placeholder="e.g. Maya Lin, Alex Chen, Jordan Taylor"
                />
              </View>

              <View className="gap-xs">
                <Text className="font-semibold text-text">Biography / Specialization</Text>
                <Input
                  value={newBio}
                  onChangeText={setNewBio}
                  placeholder="e.g. Sculptor and Architect, Pianist, Game Designer"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View className="flex-row justify-end gap-sm pt-sm">
                <Button variant="ghost" onPress={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  isLoading={isPending}
                  onPress={handleCreatePerson}
                >
                  Create & Select
                </Button>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}
