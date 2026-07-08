import { createContext, useContext, useState, type ReactNode } from 'react'

interface VideoPlaybackContextValue {
  activeVideoId: string | null
  setActiveVideoId: (id: string | null) => void
}

const VideoPlaybackContext = createContext<VideoPlaybackContextValue | null>(null)

export function VideoPlaybackProvider({ children }: { children: ReactNode }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  return (
    <VideoPlaybackContext.Provider value={{ activeVideoId, setActiveVideoId }}>
      {children}
    </VideoPlaybackContext.Provider>
  )
}

export function useVideoPlayback() {
  const context = useContext(VideoPlaybackContext)
  if (!context) {
    throw new Error('useVideoPlayback must be used within a VideoPlaybackProvider')
  }
  return context
}
