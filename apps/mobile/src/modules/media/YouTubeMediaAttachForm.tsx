import { View } from 'react-native'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { useYouTubeMediaAttach } from '@/modules/media/useYouTubeMediaAttach'

export interface YouTubeMediaAttachFormProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME'
  targetId: string
  onAttached?: () => void
  className?: string
}

export function YouTubeMediaAttachForm({ targetType, targetId, onAttached, className }: YouTubeMediaAttachFormProps) {
  const { attach, attachVideo, isAuthenticated, isAuthLoading, setTitle, setUrl, title, url } = useYouTubeMediaAttach(targetType, targetId, onAttached)

  if (isAuthLoading) return null

  if (!isAuthenticated) {
    return <SignInPrompt message="Sign in to attach media" className={className ?? 'py-sm'} />
  }

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
