import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Image, Platform, Pressable, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import { AlertCircle, CheckCircle2, ImagePlus, RefreshCw } from 'lucide-react-native'
import { ApiError, useUploadImage } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { useNativeColor, useStatusNativeColor } from '@/lib/theme'
import { Button } from '@/shared/ui/Button'
import { Text } from '@/shared/ui/Text'

type ImageTargetType = 'PLAYER' | 'TEAM' | 'GAME' | 'ATHLETE_PROFILE' | 'GAME_STAT_LINE'
type ImageUsage = 'AVATAR' | 'LOGO' | 'HERO' | 'EVIDENCE' | 'GALLERY'
type UploadMode = 'button' | 'tile' | 'image'

export interface ConnectedImageUploadButtonProps {
  targetType: ImageTargetType
  targetId: string
  usage: ImageUsage
  label?: string
  title?: string
  helperText?: string
  currentImageUri?: string | null
  mode?: UploadMode
  className?: string
  allowsEditing?: boolean
  onUploaded?: (imageUrl: string) => void
}

type SelectedImage = {
  uri: string
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
  originalFilename?: string
  width?: number
  height?: number
  byteSize: number
}

function supportedContentType(value?: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (value === 'image/png' || value === 'image/webp') return value
  return 'image/jpeg'
}

function friendlyError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'That image type is not supported. Use JPG, PNG, or WebP.'
    if (error.status === 401) return 'Sign in to upload images.'
    if (error.status === 403) return 'You do not have permission to update this image.'
    if (error.status === 413) return 'That image is too large. Choose a smaller image.'
    return error.message || 'The upload failed. Please try again.'
  }
  if (error instanceof Error) return error.message
  return 'The upload failed. Please try again.'
}

function safeHaptic(kind: 'selection' | 'success' | 'warning') {
  if (Platform.OS === 'web') return
  if (kind === 'selection') Haptics.selectionAsync()
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}

export function ConnectedImageUploadButton({
  targetType,
  targetId,
  usage,
  label,
  title,
  helperText,
  currentImageUri,
  mode = 'button',
  className,
  allowsEditing = usage === 'AVATAR' || usage === 'LOGO',
  onUploaded,
}: ConnectedImageUploadButtonProps) {
  const uploadImage = useUploadImage()
  const brandColor = useNativeColor('brand')
  const liveColor = useStatusNativeColor('live')
  const verifiedColor = useStatusNativeColor('verified')
  const mutedColor = useNativeColor('mutedText')
  const [selected, setSelected] = useState<SelectedImage | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const previewUri = selected?.uri ?? currentImageUri ?? null
  const resolvedLabel = label ?? (currentImageUri ? 'Replace Image' : 'Upload Image')
  const resolvedTitle = title ?? (usage === 'AVATAR' ? 'Profile image' : usage === 'EVIDENCE' ? 'Evidence image' : 'Image upload')
  const resolvedHelper = helperText ?? 'JPG, PNG, or WebP. The upload is saved to the shared image library.'
  const statusTone = errorMessage ? 'error' : uploadImage.isPending ? 'uploading' : successMessage ? 'success' : selected ? 'ready' : 'idle'
  const statusCopy = useMemo(() => {
    if (errorMessage) return errorMessage
    if (uploadImage.isPending) return 'Uploading image...'
    if (successMessage) return successMessage
    if (selected) return `${selected.width ?? '?'} x ${selected.height ?? '?'} selected`
    return resolvedHelper
  }, [errorMessage, resolvedHelper, selected, successMessage, uploadImage.isPending])

  async function pickImage() {
    setErrorMessage(null)
    setSuccessMessage(null)
    safeHaptic('selection')

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      const message = 'Photo library access is needed to choose an image.'
      setErrorMessage(message)
      Alert.alert('Photo access needed', message)
      safeHaptic('warning')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing,
      quality: 0.85,
    })

    if (result.canceled) return
    const asset = result.assets[0]
    if (!asset?.uri) {
      setErrorMessage('The selected image could not be read. Try a different file.')
      safeHaptic('warning')
      return
    }

    const nextSelected = {
      uri: asset.uri,
      contentType: supportedContentType(asset.mimeType),
      originalFilename: asset.fileName ?? undefined,
      width: asset.width,
      height: asset.height,
      byteSize: asset.fileSize ?? 0,
    }
    setSelected(nextSelected)

    try {
      const uploaded = await uploadImage.mutateAsync({
        targetType,
        targetId,
        usage,
        contentType: nextSelected.contentType,
        file: {
          uri: asset.uri,
          name: nextSelected.originalFilename ?? `upload.${nextSelected.contentType.split('/')[1]}`,
          type: nextSelected.contentType,
        },
        originalFilename: nextSelected.originalFilename,
        width: nextSelected.width,
        height: nextSelected.height,
      })
      setSuccessMessage(currentImageUri ? 'Image replaced.' : 'Image uploaded.')
      onUploaded?.(uploaded.data.url)
      safeHaptic('success')
    } catch (error) {
      setErrorMessage(friendlyError(error))
      safeHaptic('warning')
    }
  }

  const statusIcon = statusTone === 'success'
    ? <CheckCircle2 size={14} color={verifiedColor} />
    : statusTone === 'error'
      ? <AlertCircle size={14} color={liveColor} />
      : uploadImage.isPending
        ? <ActivityIndicator size="small" color={brandColor} />
        : null

  if (mode === 'button') {
    return (
      <View className={cn('gap-xs', className)}>
        <Button size="sm" variant="secondary" isLoading={uploadImage.isPending} onPress={pickImage}>
          {resolvedLabel}
        </Button>
        <View className="min-h-5 flex-row items-start gap-xs">
          {statusIcon}
          <Text variant="caption" className={cn(errorMessage && 'text-live', successMessage && 'text-verified')}>{statusCopy}</Text>
        </View>
      </View>
    )
  }

  return (
    <Pressable
      onPress={pickImage}
      disabled={uploadImage.isPending}
      className={cn(
        'overflow-hidden rounded-md border border-border bg-canvas active:opacity-80',
        mode === 'image' ? 'aspect-square w-24' : 'min-h-36',
        uploadImage.isPending && 'opacity-80',
        className
      )}
    >
      <View className={cn('relative flex-1', mode === 'tile' && 'min-h-36')}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
        ) : (
          <View className="absolute inset-0 items-center justify-center bg-muted-text/10">
            <ImagePlus size={mode === 'image' ? 22 : 34} color={mutedColor} />
          </View>
        )}
        <View className={cn('absolute inset-0', previewUri ? 'bg-black/30' : 'bg-transparent')} />
        <View className="absolute left-sm right-sm top-sm flex-row items-center justify-between">
          <View className="rounded-full bg-black/45 px-sm py-xs">
            <Text className="text-white text-xs font-semibold">{resolvedLabel}</Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-black/45">
            {uploadImage.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <RefreshCw size={15} color="#FFFFFF" />}
          </View>
        </View>
        {mode === 'tile' ? (
          <View className="absolute inset-x-0 bottom-0 gap-xs bg-black/55 p-sm">
            <Text className="text-white font-semibold">{resolvedTitle}</Text>
            <View className="flex-row items-start gap-xs">
              {statusIcon}
              <Text variant="caption" className={cn('flex-1 text-white/80', errorMessage && 'text-live', successMessage && 'text-verified')}>
                {statusCopy}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}
