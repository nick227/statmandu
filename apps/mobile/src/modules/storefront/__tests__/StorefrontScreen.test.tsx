import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { StorefrontScreen } from '../StorefrontScreen'
import {
  useStorefront,
  useStorefrontReleases,
  useUpdateMyStorefront,
  useStorefrontUser,
} from '@/modules/studio/hooks/useStorefront'

jest.mock('@/modules/studio/hooks/useStorefront', () => ({
  useStorefrontUser: jest.fn(),
  useStorefront: jest.fn(),
  useStorefrontReleases: jest.fn(),
  useUpdateMyStorefront: jest.fn(),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@/shared/media/SmartImage', () => ({
  SmartImage: () => {
    const { View } = require('react-native')
    return <View testID="mock-smart-image" />
  },
}))

jest.mock('@/shared/ui/Button', () => ({
  Button: ({
    children,
    onPress,
    isLoading,
    testID,
  }: {
    children: React.ReactNode
    onPress?: () => void
    isLoading?: boolean
    testID?: string
  }) => {
    const { Pressable, Text } = require('react-native')
    const label = typeof children === 'string' ? children : undefined
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
      >
        <Text>{isLoading ? 'Loading...' : children}</Text>
      </Pressable>
    )
  },
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}))

describe('StorefrontScreen', () => {
  const mockStorefront = {
    id: 'store-1',
    userId: 'user-1',
    username: 'testcreator',
    displayName: 'Test Creator',
    avatarUrl: null,
    description: 'Original digital collectibles by Test Creator.',
    commerceEnabled: false as const,
    createdAt: '2026-11-18T20:00:00Z',
    updatedAt: '2026-11-18T20:00:00Z',
  }

  const mockReleases = [
    {
      id: 'rel-1',
      title: 'Debut Edition',
      status: 'PUBLISHED' as const,
      publicationType: 'COMMUNITY' as const,
      editionMode: 'LIMITED' as const,
      editionSize: 50,
      issuedCount: 12,
      createdByUserId: 'user-1',
      currentUserHasClaimed: false,
      person: { displayName: 'Maya Angelou', slug: 'maya' },
      templateSnapshot: {
        schemaVersion: 1 as const,
        templateId: 't-1',
        revision: 1,
        rendererVersion: 'rdc-composition-v1',
        composition: { schemaVersion: 1 as const, canvas: { width: 600, height: 900 }, layers: [] },
        person: { displayName: 'Maya Angelou', slug: 'maya' } as any,
        assetIds: [],
        assets: [],
      },
    },
  ]

  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStorefrontUser as jest.Mock).mockReturnValue({ username: 'testcreator', isLoading: false })
    ;(useStorefront as jest.Mock).mockReturnValue({ data: mockStorefront, isLoading: false, isError: false })
    ;(useStorefrontReleases as jest.Mock).mockReturnValue({ data: { releases: mockReleases }, isLoading: false })
    ;(useUpdateMyStorefront as jest.Mock).mockReturnValue({ mutateAsync: mockMutate, isPending: false })
  })

  it('renders creator storefront metadata and published releases without fake checkout', async () => {
    const screen = await render(<StorefrontScreen username="testcreator" />)

    expect(screen.getByText('Test Creator')).toBeTruthy()
    expect(screen.getByText('@testcreator')).toBeTruthy()
    expect(screen.getByText('Creator Catalog')).toBeTruthy()
    expect(screen.getByText('Original digital collectibles by Test Creator.')).toBeTruthy()
    expect(screen.getByText('Debut Edition')).toBeTruthy()
    expect(screen.getByText('Community Edition')).toBeTruthy()
    expect(screen.getByText('12/50 claimed')).toBeTruthy()

    expect(screen.queryByText(/checkout/i)).toBeNull()
    expect(screen.queryByText(/buy now/i)).toBeNull()
    expect(screen.queryByText(/cart/i)).toBeNull()
  })

  it('allows creator to edit catalog description statement', async () => {
    const screen = await render(<StorefrontScreen username="testcreator" />)

    expect(screen.getByText('Edit Statement')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Edit Statement'))

    const input = screen.getByTestId('creator-statement-input')
    await fireEvent.changeText(input, 'Updated creator statement.')

    await fireEvent.press(screen.getByLabelText('Save'))

    expect(mockMutate).toHaveBeenCalledWith({
      description: 'Updated creator statement.',
    })
  })
})
