import { useState } from 'react'
import { View } from 'react-native'
import { useAttachYouTubeMedia } from '@statman/sdk'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface MediaAttachFormProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME'
  targetId: string
  onAttached?: () => void
  className?: string
}

// Media Upload/Attach — surface 9. YouTube-only for MVP (no direct video
// hosting). Embedded in a profile's Media tab rather than being a standalone
// route — attaching media is always "attach to the thing I'm looking at."
export function MediaAttachForm({ targetType, targetId, onAttached, className }: MediaAttachFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const attach = useAttachYouTubeMedia()

  return (
    <View className={className ?? 'gap-sm'}>
      <Input placeholder="YouTube URL" autoCapitalize="none" value={url} onChangeText={setUrl} />
      <Input placeholder="Title (optional)" value={title} onChangeText={setTitle} />
      <Button
        size="sm"
        isLoading={attach.isPending}
        disabled={!url}
        onPress={async () => {
          await attach.mutateAsync({ targetType, targetId, youtubeUrl: url, title: title || undefined })
          setUrl('')
          setTitle('')
          onAttached?.()
        }}
      >
        Attach Video
      </Button>
    </View>
  )
}
