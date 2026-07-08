import { useEffect, useState, useRef } from 'react'
import { View, Dimensions } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence, runOnJS, Easing } from 'react-native-reanimated'
import { Text } from '@/shared/ui/Text'

const EMOJI_MAP: Record<string, string> = {
  LIKE: '👍',
  FIRE: '🔥',
  CLAP: '👏',
}

const { width, height } = Dimensions.get('window')

export function FloatingReactionsOverlay({ reactions }: { reactions: { id: string, type: string, deviceId: string }[] }) {
  const [activeReactions, setActiveReactions] = useState<{ id: string, emoji: string, startX: number }[]>([])
  const seenIds = useRef(new Set<string>())

  useEffect(() => {
    const newReactions = reactions.filter(r => !seenIds.current.has(r.id))
    if (newReactions.length === 0) return

    newReactions.forEach(r => seenIds.current.add(r.id))
    
    const elements = newReactions.map(r => ({
      id: r.id,
      emoji: EMOJI_MAP[r.type] || '👍',
      startX: Math.random() * (width - 60) + 30, // Random X position within screen bounds
    }))

    setActiveReactions(prev => [...prev, ...elements])
  }, [reactions])

  const removeReaction = (id: string) => {
    setActiveReactions(prev => prev.filter(r => r.id !== id))
  }

  return (
    <View className="absolute inset-0 z-50 overflow-hidden" pointerEvents="none">
      {activeReactions.map(r => (
        <FloatingEmoji key={r.id} emoji={r.emoji} startX={r.startX} onComplete={() => removeReaction(r.id)} />
      ))}
    </View>
  )
}

function FloatingEmoji({ emoji, startX, onComplete }: { emoji: string, startX: number, onComplete: () => void }) {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(1)
  const translateX = useSharedValue(startX)

  useEffect(() => {
    translateY.value = withTiming(-height * 0.6, { duration: 2500, easing: Easing.out(Easing.ease) })
    opacity.value = withSequence(
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 1000 }, (finished) => {
        if (finished) runOnJS(onComplete)()
      })
    )
    translateX.value = withTiming(startX + (Math.random() * 100 - 50), { duration: 2500 })
  }, [])

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 80, // Start slightly above the toolbar
    left: 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={style}>
      <Text className="text-4xl">{emoji}</Text>
    </Animated.View>
  )
}
