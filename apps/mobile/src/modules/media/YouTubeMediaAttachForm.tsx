import { View } from 'react-native'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useYouTubeMediaAttach } from '@/modules/media/useYouTubeMediaAttach'

export interface YouTubeMediaAttachFormProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME'
  targetId: string
  onAttached?: () => void
  className?: string
}

export function YouTubeMediaAttachForm({ targetType, targetId, onAttached, className }: YouTubeMediaAttachFormProps) {
  const { attach, attachVideo, setTitle, setUrl, title, url } = useYouTubeMediaAttach(targetType, targetId, onAttached)

  return (
    <View className={className ?? 'gap-sm'}>
      <Input placeholder="YouTube URL" autoCapitalize="none" value={url} onChangeText={setUrl} />
      <Input placeholder="Title (optional)" value={title} onChangeText={setTitle} />
      <Button
        size="sm"
        isLoading={attach.isPending}
        disabled={!url}
        onPress={attachVideo}
      >
        Attach Video
      </Button>
    </View>
  )
}
