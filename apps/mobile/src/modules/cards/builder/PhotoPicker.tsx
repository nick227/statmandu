import { Image, Pressable, ScrollView, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/lib/utils'
import type { useCardBuilderData } from './useCardBuilderData'
import type { CardBuilderState } from './cardBuilderTypes'

// Shared "select or upload a reference photo" step body — see
// SubjectPicker.tsx for why this got extracted (a second real call site,
// the batch generator, needed the identical gallery-pick UI).
export function PhotoPicker({
  builderData,
  state,
  updateState,
}: {
  builderData: ReturnType<typeof useCardBuilderData>
  state: Pick<CardBuilderState, 'sourceImageAssetId' | 'sourceImageUrl'>
  updateState: (updates: Partial<CardBuilderState>) => void
}) {
  return (
    <View className="gap-md">
      <Button variant="secondary" isLoading={builderData.isUploading} onPress={builderData.pickAndUploadPhoto}>
        Upload to gallery
      </Button>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {builderData.gallery.map((image) => {
          const selected = image.id === state.sourceImageAssetId
          return (
            <Pressable
              key={image.id}
              onPress={() => updateState({ sourceImageAssetId: image.id, sourceImageUrl: image.url })}
              className={cn('h-24 w-24 overflow-hidden rounded-md border', selected ? 'border-brand' : 'border-border')}
            >
              <Image source={{ uri: image.url }} className="h-full w-full" resizeMode="cover" />
            </Pressable>
          )
        })}
      </ScrollView>
      {builderData.galleryQuery.isLoading ? <Text variant="caption">Loading gallery...</Text> : null}
      {builderData.galleryQuery.isError ? <Text variant="caption">Gallery couldn't be loaded.</Text> : null}
      {!builderData.galleryQuery.isLoading && builderData.gallery.length === 0 ? (
        <Text variant="caption">No gallery images yet. Uploading here saves the image for future cards.</Text>
      ) : null}
      {state.sourceImageUrl ? <Text variant="caption" className="text-brand">Photo selected.</Text> : null}
    </View>
  )
}
