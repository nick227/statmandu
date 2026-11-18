import React from 'react'
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import { cardFlipDirectionForGesture, FlippableCard } from '../FlippableCard'

describe('FlippableCard', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(() => undefined))
    jest.spyOn(Animated, 'timing').mockImplementation(((value: Animated.Value, config: Animated.TimingAnimationConfig) => ({
      start: (callback?: (result: { finished: boolean }) => void) => {
        value.setValue(Number(config.toValue))
        callback?.({ finished: true })
      },
      stop: jest.fn(),
      reset: jest.fn(),
    })) as typeof Animated.timing)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('offers identical directional controls and reports the next controlled side', async () => {
    const onSideChange = jest.fn()
    const screen = await render(
      <FlippableCard
        front={<Text>Front artwork</Text>}
        back={<Text>Back artwork</Text>}
        side="front"
        onSideChange={onSideChange}
        accessibilityName="Jordan Lee trading card"
      />
    )

    expect(screen.getByLabelText('Flip card left, show back')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByTestId('card-face-current').props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
    expect(StyleSheet.flatten(screen.getByLabelText('Flip card left, show back').props.style)).toMatchObject({ left: -24 })
    expect(StyleSheet.flatten(screen.getByLabelText('Flip card right, show back').props.style)).toMatchObject({ right: -24 })
    await fireEvent.press(screen.getByLabelText('Flip card right, show back'))

    expect(onSideChange).toHaveBeenCalledWith('back')

    await screen.rerender(
      <FlippableCard
        front={<Text>Front artwork</Text>}
        back={<Text>Back artwork</Text>}
        side="back"
        onSideChange={onSideChange}
        accessibilityName="Jordan Lee trading card"
      />
    )
    expect(screen.getByLabelText('Flip card right, show front')).toBeTruthy()
  })

  it('requires a deliberate horizontal swipe and preserves direction', () => {
    expect(cardFlipDirectionForGesture(-60, 4)).toBe('left')
    expect(cardFlipDirectionForGesture(60, 4)).toBe('right')
    expect(cardFlipDirectionForGesture(30, 2)).toBeNull()
    expect(cardFlipDirectionForGesture(60, 50)).toBeNull()
  })
})
