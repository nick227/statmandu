import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Animated, PanResponder, Pressable, View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { CARD_GEOMETRY } from './cardGeometry'

export type CardSide = 'front' | 'back'
type FlipDirection = 'left' | 'right'

export interface FlippableCardProps {
  front: ReactNode
  back: ReactNode
  side?: CardSide
  initialSide?: CardSide
  onSideChange?: (side: CardSide) => void
  accessibilityName: string
}

const SWIPE_THRESHOLD = 48
const FLIP_DURATION_MS = 360
export const FLIP_TAB_WIDTH = CARD_GEOMETRY.interactionGutter
const ABSOLUTE_FILL = { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 }

export function cardFlipDirectionForGesture(dx: number, dy: number): FlipDirection | null {
  if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy) * 1.5) return null
  return dx < 0 ? 'left' : 'right'
}

/** The sole online interaction wrapper for every Statman trading card. */
export function FlippableCard({ front, back, side, initialSide = 'front', onSideChange, accessibilityName }: FlippableCardProps) {
  const [internalSide, setInternalSide] = useState<CardSide>(initialSide)
  const [direction, setDirection] = useState<FlipDirection>('right')
  const [isAnimating, setIsAnimating] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const progress = useRef(new Animated.Value(0)).current
  const visibleSide = side ?? internalSide
  const sideRef = useRef(visibleSide)

  useEffect(() => {
    sideRef.current = visibleSide
  }, [visibleSide])

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => subscription.remove()
  }, [])

  function flip(nextDirection: FlipDirection) {
    if (isAnimating) return
    setDirection(nextDirection)
    setIsAnimating(true)
    progress.setValue(0)
    Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 0 : FLIP_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      setIsAnimating(false)
      progress.setValue(0)
      if (!finished) return
      const nextSide = sideRef.current === 'front' ? 'back' : 'front'
      if (side === undefined) setInternalSide(nextSide)
      onSideChange?.(nextSide)
    })
  }

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (_, gesture) => {
        const swipeDirection = cardFlipDirectionForGesture(gesture.dx, gesture.dy)
        if (swipeDirection) flip(swipeDirection)
      },
      onPanResponderTerminate: () => undefined,
    }),
    [isAnimating, reduceMotion, side]
  )

  const rotation = direction === 'right' ? 180 : -180
  const incomingStart = direction === 'right' ? -180 : 180
  const outgoingStyle = {
    transform: [
      { perspective: 1200 },
      { rotateY: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${rotation}deg`] }) },
    ],
  }
  const incomingStyle = {
    transform: [
      { perspective: 1200 },
      { rotateY: progress.interpolate({ inputRange: [0, 1], outputRange: [`${incomingStart}deg`, '0deg'] }) },
    ],
  }
  const nextSide = visibleSide === 'front' ? 'back' : 'front'

  return (
    <View
      className="relative flex-1"
      style={{ overflow: 'visible' }}
      {...panResponder.panHandlers}
      accessibilityLabel={`${accessibilityName}, ${visibleSide} side`}
    >
      {/* Animated.View does not consistently receive NativeWind's inset-0
          styles on web. Native absolute-fill geometry is mandatory here:
          without it, each face collapses to its content height while the
          interaction layer correctly remains 5:7. */}
      <View testID="card-face-current" style={ABSOLUTE_FILL}>
        <Animated.View style={[{ flex: 1, backfaceVisibility: 'hidden' }, outgoingStyle]}>
          {visibleSide === 'front' ? front : back}
        </Animated.View>
      </View>
      <View testID="card-face-incoming" pointerEvents="none" style={ABSOLUTE_FILL}>
        <Animated.View style={[{ flex: 1, backfaceVisibility: 'hidden' }, incomingStyle]}>
          {nextSide === 'front' ? front : back}
        </Animated.View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Flip card left, show ${nextSide}`}
        onPress={() => flip('left')}
        className="absolute h-11 w-6 items-center justify-center rounded-l-full border border-r-0 border-white/40 bg-black/75 active:bg-black"
        style={{ left: -FLIP_TAB_WIDTH, top: '50%', marginTop: -22 }}
        hitSlop={{ left: 10, right: 10, top: 6, bottom: 6 }}
      >
        <ChevronLeft size={15} color="#FFFFFF" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Flip card right, show ${nextSide}`}
        onPress={() => flip('right')}
        className="absolute h-11 w-6 items-center justify-center rounded-r-full border border-l-0 border-white/40 bg-black/75 active:bg-black"
        style={{ right: -FLIP_TAB_WIDTH, top: '50%', marginTop: -22 }}
        hitSlop={{ left: 10, right: 10, top: 6, bottom: 6 }}
      >
        <ChevronRight size={15} color="#FFFFFF" />
      </Pressable>
    </View>
  )
}
