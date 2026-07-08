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
import { X, Play } from 'lucide-react-native'
import { SmartImage } from './SmartImage'
import { youtubeThumbnailUrl, youtubeWatchUrl } from './youtube'
import { Text } from '@/shared/ui/Text'

export interface FullScreenMediaItem {
  id: string
  youtubeVideoId: string
  title?: string | null
}

export interface FullScreenMediaViewerProps {
  visible: boolean
  items: FullScreenMediaItem[]
  initialIndex?: number
  onClose: () => void
}

const DISMISS_THRESHOLD = 120

// The "full screen immersive" tier of the three-tier media system (grid →
// half-screen hero → this). Tap anywhere fades the chrome in/out, swipe
// horizontally moves between items, drag down shrinks + fades the whole
// stage away and dismisses past a threshold — "reducing view size
// transition" as an actual gesture, not just a close button.
export function FullScreenMediaViewer({ visible, items, initialIndex = 0, onClose }: FullScreenMediaViewerProps) {
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const listRef = useRef<FlatList<FullScreenMediaItem>>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [chromeVisible, setChromeVisible] = useState(true)

  const translateY = useSharedValue(0)
  const dragProgress = useSharedValue(0)

  const clampedInitialIndex = items.length > 0 ? Math.min(Math.max(initialIndex, 0), items.length - 1) : 0

  useEffect(() => {
    if (!visible || items.length === 0) return
    setActiveIndex(clampedInitialIndex)
    setChromeVisible(true)
    translateY.value = 0
    dragProgress.value = 0
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: clampedInitialIndex, animated: false })
    })
  }, [clampedInitialIndex, dragProgress, items.length, translateY, visible])

  function handleMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))
  }

  function handleClose() {
    translateY.value = 0
    dragProgress.value = 0
    onClose()
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) return
      translateY.value = e.translationY
      dragProgress.value = Math.min(e.translationY / DISMISS_THRESHOLD, 1)
    })
    .onEnd((e) => {
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
                  className="items-center justify-center"
                  onPress={() => setChromeVisible((v) => !v)}
                >
                  <SmartImage uri={youtubeThumbnailUrl(item.youtubeVideoId)} className="h-full w-full" resizeMode="contain" />
                  <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                    <View className="h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/50">
                      <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </View>
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
              {activeItem?.title ? <Text className="font-semibold text-white">{activeItem.title}</Text> : null}
              <Pressable
                onPress={() => activeItem && Linking.openURL(youtubeWatchUrl(activeItem.youtubeVideoId))}
                className="flex-row items-center justify-center gap-sm rounded-md bg-white/15 border border-white/20 py-md"
              >
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text className="font-semibold text-white">Watch on YouTube</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  )
}
