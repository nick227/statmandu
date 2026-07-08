import { Platform, View, type ViewStyle } from 'react-native'
import { WebView } from 'react-native-webview'
import { youtubeEmbedUrl } from './youtube'

export interface YouTubePlayerProps {
  videoId: string
  autoplay?: boolean
  mounted?: boolean
  className?: string
  style?: ViewStyle
}

function WebYouTubePlayer({ src, className, style }: { src: string; className?: string; style?: ViewStyle }) {
  return (
    <View className={className ?? 'h-full w-full bg-black'} style={style}>
      <iframe
        src={src}
        title="YouTube player"
        style={{ width: '100%', height: '100%', border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  )
}

export function YouTubePlayer({ videoId, autoplay = false, mounted = true, className, style }: YouTubePlayerProps) {
  if (!mounted) return null

  const src = youtubeEmbedUrl(videoId, { autoplay })

  if (Platform.OS === 'web') {
    return <WebYouTubePlayer src={src} className={className} style={style} />
  }

  return (
    <View className={className ?? 'flex-1 bg-black'} style={style}>
      <WebView
        source={{ uri: src }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={!autoplay}
        javaScriptEnabled
        style={{ flex: 1, backgroundColor: '#000' }}
      />
    </View>
  )
}
