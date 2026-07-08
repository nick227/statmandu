import { useEffect, useRef, useState } from 'react'
import { FlatList, Linking, Modal, Pressable, View, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Play, UserRound } from 'lucide-react-native'
import { FilmLabelBadge } from './FilmLabelBadge'
import type { MediaTargetType } from './mediaLabels'
import { VideoStage } from './VideoStage'
import { youtubeWatchUrl } from './youtube'
import { Text } from '@/shared/ui/Text'

export interface FullScreenMediaItem {
  id: string
  youtubeVideoId: string
  title?: string | null
  targetType?: MediaTargetType
  targetId?: string
  filmLabel?: string
}

export interface FullScreenMediaViewerProps {
  visible: boolean
  items: FullScreenMediaItem[]
  initialIndex?: number
  onClose: () => void
  onViewTarget?: (item: FullScreenMediaItem) => void
  getTargetActionLabel?: (item: FullScreenMediaItem) => string | null
}

const DISMISS_THRESHOLD = 120

export function FullScreenMediaViewer({
  visible,
  items,
  initialIndex = 0,
  onClose,
  onViewTarget,
  getTargetActionLabel,
}: FullScreenMediaViewerProps) {
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const listRef = useRef<FlatList<FullScreenMediaItem>>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const translateY = useSharedValue(0)
  const dragProgress = useSharedValue(0)

  const clampedInitialIndex = items.length > 0 ? Math.min(Math.max(initialIndex, 0), items.length - 1) : 0

  useEffect(() => {
    if (!visible || items.length === 0) return
    setActiveIndex(clampedInitialIndex)
    setChromeVisible(true)
    setPlayingId(null)
    translateY.value = 0
    dragProgress.value = 0
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: clampedInitialIndex, animated: false })
    })
  }, [clampedInitialIndex, dragProgress, items.length, translateY, visible])

  function handleMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(next)
    setPlayingId(null)
  }

  function handleClose() {
    setPlayingId(null)
    translateY.value = 0
    dragProgress.value = 0
    onClose()
  }

  const pan = Gesture.Pan()
    .activeOffsetY(24)
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      if (playingId || e.translationY < 0) return
      translateY.value = e.translationY
      dragProgress.value = Math.min(e.translationY / DISMISS_THRESHOLD, 1)
    })
    .onEnd((e) => {
      if (playingId) return
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 800) {
        translateY.value = withTiming(height, { duration: 180 })
        dragProgress.value = withTiming(1, { duration: 180 }, () => runOnJS(handleClose)())
      } else {
        translateY.value = withSpring(0)
        dragProgress.value = withSpring(0)
      }
    })

  const stageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: interpolate(dragProgress.value, [0, 1], [1, 0.85], Extrapolation.CLAMP) },
    ],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragProgress.value, [0, 1], [1, 0.4], Extrapolation.CLAMP),
  }))

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(chromeVisible ? 1 : 0, { duration: 180 }),
  }))

  if (!visible || items.length === 0) return null

  const activeItem = items[activeIndex]
  const targetActionLabel = activeItem && getTargetActionLabel?.(activeItem)
  const canViewTarget = Boolean(activeItem?.targetType && activeItem.targetId && onViewTarget && targetActionLabel)
  const isPlaying = Boolean(activeItem && playingId === activeItem.id)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Animated.View style={[{ flex: 1, backgroundColor: '#000' }, backdropStyle]}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ flex: 1 }, stageStyle]}>
            <FlatList
              ref={listRef}
              data={items}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              scrollEnabled={!isPlaying}
              initialScrollIndex={clampedInitialIndex}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              onScrollToIndexFailed={({ index }) => {
                requestAnimationFrame(() => {
                  listRef.current?.scrollToOffset({ offset: width * index, animated: false })
                })
              }}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumEnd}
              renderItem={({ item }) => (
                <Pressable
                  style={{ width, height }}
                  onPress={() => playingId !== item.id && setChromeVisible((v) => !v)}
                >
                  <VideoStage
                    videoId={item.youtubeVideoId}
                    mode="immersive"
                    width={width}
                    height={height}
                    isPlaying={playingId === item.id}
                    onPlayRequest={() => {
                      setPlayingId(item.id)
                      setChromeVisible(true)
                    }}
                  />
                </Pressable>
              )}
            />

            <Animated.View pointerEvents={chromeVisible ? 'auto' : 'none'} style={[{ position: 'absolute', top: insets.top + 12, left: 0, right: 0 }, chromeStyle]} className="flex-row items-center justify-between px-lg">
              <Pressable onPress={handleClose} className="h-10 w-10 items-center justify-center rounded-full bg-black/50">
                <X size={20} color="#FFFFFF" />
              </Pressable>
              {items.length > 1 ? (
                <Text className="text-white/80">{activeIndex + 1} / {items.length}</Text>
              ) : null}
            </Animated.View>

            <Animated.View pointerEvents={chromeVisible ? 'auto' : 'none'} style={[{ position: 'absolute', bottom: insets.bottom + 24, left: 0, right: 0 }, chromeStyle]} className="gap-md px-lg">
              {activeItem?.filmLabel ? <FilmLabelBadge label={activeItem.filmLabel} tone="dark" /> : null}
              {activeItem?.title ? <Text className="font-semibold text-white">{activeItem.title}</Text> : null}
              {canViewTarget ? (
                <Pressable
                  onPress={() => activeItem && onViewTarget?.(activeItem)}
                  className="flex-row items-center justify-center gap-sm rounded-md border border-white/25 bg-white/10 py-md"
                >
                  <UserRound size={16} color="#FFFFFF" />
                  <Text className="font-semibold text-white">{targetActionLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => activeItem && Linking.openURL(youtubeWatchUrl(activeItem.youtubeVideoId))}
                className="flex-row items-center justify-center gap-sm rounded-md border border-white/20 bg-white/15 py-md"
              >
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text className="font-semibold text-white">Open in YouTube</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  )
}
