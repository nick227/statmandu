import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { FlagshipDesignGalleryScreen } from '../FlagshipDesignGalleryScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}))

jest.mock('@/shared/ui/Button', () => ({
  Button: ({
    children,
    onPress,
    isLoading,
    disabled,
    testID,
  }: {
    children: React.ReactNode
    onPress?: () => void
    isLoading?: boolean
    disabled?: boolean
    testID?: string
  }) => {
    const { Pressable, Text } = require('react-native')
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled || isLoading}
      >
        <Text>{isLoading ? 'Loading...' : children}</Text>
      </Pressable>
    )
  },
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('FlagshipDesignGalleryScreen (Visual Quality Gate)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the gallery with 20 flagship collectible cards', async () => {
    const screen = await render(<FlagshipDesignGalleryScreen />)

    expect(screen.getByText('20 Flagship Collectible Designs')).toBeTruthy()
    expect(screen.getByTestId('gallery-card-classic-collector')).toBeTruthy()
    expect(screen.getByTestId('gallery-card-prestige-gold')).toBeTruthy()
    expect(screen.getByTestId('gallery-card-minimalist-swiss')).toBeTruthy()
    expect(screen.getByTestId('gallery-card-arcade-1985')).toBeTruthy()
  })

  it('toggles between benchmark subject and diverse creator profiles', async () => {
    const screen = await render(<FlagshipDesignGalleryScreen />)

    const diverseBtn = screen.getByTestId('subject-mode-diverse')
    fireEvent.press(diverseBtn)

    await waitFor(() => {
      expect(screen.getByTestId('gallery-card-classic-collector')).toBeTruthy()
    })

    const benchmarkBtn = screen.getByTestId('subject-mode-benchmark')
    fireEvent.press(benchmarkBtn)

    await waitFor(() => {
      expect(screen.getByTestId('gallery-card-classic-collector')).toBeTruthy()
    })
  })

  it('filters cards by family', async () => {
    const screen = await render(<FlagshipDesignGalleryScreen />)

    const arcadeFilter = screen.getByTestId('filter-family-Arcade')
    fireEvent.press(arcadeFilter)

    await waitFor(() => {
      expect(screen.getByTestId('gallery-card-arcade-1985')).toBeTruthy()
      expect(screen.queryByTestId('gallery-card-prestige-gold')).toBeNull()
    })
  })

  it('opens detailed inspection modal when maximize button is clicked', async () => {
    const screen = await render(<FlagshipDesignGalleryScreen />)

    const inspectBtn = screen.getByTestId('inspect-button-classic-collector')
    fireEvent.press(inspectBtn)

    await waitFor(() => {
      expect(screen.getByText('Open in Card Studio')).toBeTruthy()
    })
  })
})
