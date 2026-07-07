import { useState } from 'react'
import { useAttachYouTubeMedia } from '@statman/sdk'

export function useYouTubeMediaAttach(targetType: 'PLAYER' | 'TEAM' | 'GAME', targetId: string, onAttached?: () => void) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const attach = useAttachYouTubeMedia()

  async function attachVideo() {
    await attach.mutateAsync({ targetType, targetId, youtubeUrl: url, title: title || undefined })
    setUrl('')
    setTitle('')
    onAttached?.()
  }

  return {
    attach,
    attachVideo,
    title,
    setTitle,
    url,
    setUrl,
  }
}
