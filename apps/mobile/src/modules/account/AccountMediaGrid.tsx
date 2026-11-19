import { useState } from 'react'
import {
  Modal,
  Pressable,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  UploadCloud,
  Trash2,
  ExternalLink,
  X,
  Check,
  Plus,
} from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { SmartImage } from '@/shared/media/SmartImage'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import {
  useUnifiedMediaLibrary,
  type MediaLibraryItem,
} from '@/modules/media/useUnifiedMediaLibrary'

export interface AccountMediaGridProps {
  athleteProfileId?: string | null
  className?: string
}

export function AccountMediaGrid({ athleteProfileId, className }: AccountMediaGridProps) {
  const router = useRouter()
  const brandColor = useNativeColor('brand')

  const {
    userLibrary,
    isUploading,
    removeUploadedMedia,
    pickAndUploadMedia,
  } = useUnifiedMediaLibrary({ personProfileId: athleteProfileId })

  const [selectedItem, setSelectedItem] = useState<MediaLibraryItem | null>(null)
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null)

  async function handleUpload() {
    setUploadFeedback(null)
    const result = await pickAndUploadMedia({ targetId: athleteProfileId ?? undefined })
    if (result.success) {
      setUploadFeedback('Media uploaded successfully')
      setTimeout(() => setUploadFeedback(null), 3000)
    } else if (result.error) {
      setUploadFeedback(result.error)
      setTimeout(() => setUploadFeedback(null), 4000)
    }
  }

  function handleUseInStudio(_item: MediaLibraryItem) {
    setSelectedItem(null)
    router.push('/cards/studio')
  }

  return (
    <View className={cn('rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-6 shadow-xs', className)}>
      {/* 1. Header (Single word heading: Media) */}
      <View className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <View className="flex-row items-center gap-2.5">
          <Text className="text-xl font-bold tracking-tight text-text">
            Media
          </Text>
          <View className="rounded-full bg-border/60 px-2 py-0.5">
            <Text className="text-xs font-semibold text-muted-text">
              {userLibrary.length}
            </Text>
          </View>
        </View>

        <Button
          size="sm"
          variant="primary"
          icon={UploadCloud}
          isLoading={isUploading}
          onPress={handleUpload}
          testID="upload-media-button"
        >
          Upload
        </Button>
      </View>

      {/* Upload Feedback Toast */}
      {uploadFeedback ? (
        <View className="flex-row items-center gap-2 rounded-xl bg-brand/10 border border-brand/30 px-3.5 py-2">
          <Check size={14} color={brandColor} />
          <Text className="text-xs font-semibold text-brand">
            {uploadFeedback}
          </Text>
        </View>
      ) : null}

      {/* 2. Media Grid (User uploads only: All and Presets cut) */}
      <View className="flex-row flex-wrap gap-3">
        {/* Upload Action Tile */}
        <Pressable
          onPress={handleUpload}
          className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] xl:w-[calc(25%-9px)] aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand/60 bg-canvas/60 items-center justify-center p-3 gap-2 active:opacity-75 transition-all"
          accessibilityRole="button"
          accessibilityLabel="Upload media tile"
        >
          <View className="h-10 w-10 rounded-full bg-brand/10 items-center justify-center">
            <Plus size={20} color={brandColor} />
          </View>
          <Text className="text-xs font-bold text-text text-center">
            Upload
          </Text>
          <Text className="text-[10px] text-muted-text text-center">
            JPG, PNG, WebP
          </Text>
        </Pressable>

        {/* User Media Tiles */}
        {userLibrary.map((item) => (
          <View
            key={item.id}
            className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] xl:w-[calc(25%-9px)] aspect-square rounded-xl border border-border/80 bg-neutral-900 overflow-hidden relative group"
          >
            <Pressable
              onPress={() => setSelectedItem(item)}
              className="w-full h-full active:opacity-85"
              accessibilityRole="button"
              accessibilityLabel={`View ${item.label}`}
            >
              <SmartImage
                uri={item.url}
                className="w-full h-full"
                resizeMode="cover"
              />

              {/* Source Tag */}
              <View className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur-xs px-1.5 py-0.5">
                <Text className="text-[9px] font-bold uppercase tracking-wider text-white">
                  Upload
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Empty State */}
      {userLibrary.length === 0 ? (
        <View className="py-4 items-center justify-center">
          <Text variant="caption" className="text-muted-text text-sm">
            No uploads yet. Click Upload to add your first image.
          </Text>
        </View>
      ) : null}

      {/* 3. Preview Modal */}
      {selectedItem ? (
        <Modal
          visible={Boolean(selectedItem)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View className="flex-1 bg-black/80 items-center justify-center p-4">
            <View className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-900 p-5 gap-4 shadow-2xl">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between border-b border-neutral-800 pb-3">
                <Text
                  className="text-base font-bold text-white flex-1 mr-2"
                  numberOfLines={1}
                >
                  {selectedItem.label}
                </Text>
                <Pressable
                  onPress={() => setSelectedItem(null)}
                  className="p-1 rounded-full hover:bg-neutral-800 active:opacity-60"
                  accessibilityLabel="Close media modal"
                >
                  <X size={18} color="#a3a3a3" />
                </Pressable>
              </View>

              {/* Image Preview */}
              <View className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-neutral-800 items-center justify-center">
                <SmartImage
                  uri={selectedItem.url}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              {/* Metadata details */}
              <View className="flex-row items-center justify-between text-xs pt-1">
                <View className="flex-row items-center gap-2">
                  <Badge tone="brand">
                    Upload
                  </Badge>
                  {selectedItem.category ? (
                    <Text className="text-xs text-neutral-400">
                      {selectedItem.category}
                    </Text>
                  ) : null}
                </View>

                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  onPress={() => {
                    removeUploadedMedia(selectedItem.id)
                    setSelectedItem(null)
                  }}
                >
                  Delete
                </Button>
              </View>

              {/* Actions */}
              <View className="flex-row items-center gap-3 pt-2 border-t border-neutral-800">
                <Button
                  size="md"
                  variant="primary"
                  icon={ExternalLink}
                  className="flex-1"
                  onPress={() => handleUseInStudio(selectedItem)}
                >
                  Studio
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onPress={() => setSelectedItem(null)}
                >
                  Close
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  )
}
