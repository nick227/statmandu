import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { SmartImage } from '../SmartImage'

jest.mock('expo-image', () => ({
  Image: (props: Record<string, unknown>) => {
    const { View } = require('react-native')
    return <View testID="expo-image" {...props} />
  },
}))

jest.mock('nativewind', () => ({ cssInterop: jest.fn() }))

describe('SmartImage', () => {
  it('enables caching, transitions, and stable content fitting', async () => {
    const screen = await render(<SmartImage uri="https://example.com/athlete.jpg" resizeMode="contain" />)
    expect(screen.getByTestId('expo-image').props).toEqual(expect.objectContaining({
      cachePolicy: 'memory-disk',
      contentFit: 'contain',
      recyclingKey: 'https://example.com/athlete.jpg',
      transition: 180,
    }))
  })

  it('renders the supplied fallback after a remote image error', async () => {
    const { Text } = require('react-native')
    const screen = await render(<SmartImage uri="https://example.com/broken.jpg" fallback={<Text>Image unavailable</Text>} />)
    fireEvent(screen.getByTestId('expo-image'), 'error', { error: 'failed' })
    await waitFor(() => expect(screen.getByText('Image unavailable')).toBeTruthy())
  })
})
