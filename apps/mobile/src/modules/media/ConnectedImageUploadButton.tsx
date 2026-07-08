import { Alert, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useUploadImage } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { Text } from '@/shared/ui/Text'

type ImageTargetType = 'PLAYER' | 'TEAM' | 'GAME' | 'ATHLETE_PROFILE' | 'GAME_STAT_LINE'
type ImageUsage = 'AVATAR' | 'LOGO' | 'HERO' | 'EVIDENCE' | 'GALLERY'

export interface ConnectedImageUploadButtonProps {
  targetType: ImageTargetType
  targetId: string
  usage: ImageUsage
  label?: string
  className?: string
  allowsEditing?: boolean
}

function supportedContentType(value?: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (value === 'image/png' || value === 'image/webp') return value
  return 'image/jpeg'
}

export function ConnectedImageUploadButton({
  targetType,
  targetId,
  usage,
  label = 'Upload Image',
  className,
  allowsEditing = usage === 'AVATAR' || usage === 'LOGO',
}: ConnectedImageUploadButtonProps) {
  const uploadImage = useUploadImage()

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing,
      quality: 0.85,
      base64: true,
    })

    if (result.canceled) return
    const asset = result.assets[0]
    if (!asset?.base64) {
      Alert.alert('Upload failed', 'The selected image could not be read.')
      return
    }

    try {
      await uploadImage.mutateAsync({
        targetType,
        targetId,
        usage,
        contentType: supportedContentType(asset.mimeType),
        dataBase64: asset.base64,
        originalFilename: asset.fileName ?? undefined,
        width: asset.width,
        height: asset.height,
      })
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try another image.')
    }
  }

  return (
    <View className={className}>
      <Button size="sm" variant="secondary" isLoading={uploadImage.isPending} onPress={pickImage}>
        {label}
      </Button>
      {uploadImage.isSuccess ? <Text variant="caption">Image uploaded.</Text> : null}
    </View>
  )
}
