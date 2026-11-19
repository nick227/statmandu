import React from 'react'
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native'
import { CardStudioScreen } from '../CardStudioScreen'
import { useStudioUser } from '../hooks/useStudioUser'
import {
  useCardDesigns,
  useCreateCardDesign,
  useUpdateCardDesign,
} from '../hooks/useCardDesigns'
import {
  useCreateRelease,
  useGenerateRelease,
  usePublishRelease,
} from '../hooks/useReleases'

jest.mock('@/modules/typography/textFit', () => {
  const actual = jest.requireActual('@/modules/typography/textFit')
  return { ...actual, areFontsReady: () => true, waitForFontsLoaded: async () => true }
})

jest.mock('../hooks/useStudioUser', () => ({
  useStudioUser: jest.fn(),
}))

jest.mock('../hooks/useCardDesigns', () => {
  const actual = jest.requireActual('../hooks/useCardDesigns')
  return {
    ...actual,
    useCardDesigns: jest.fn(),
    useCreateCardDesign: jest.fn(),
    useUpdateCardDesign: jest.fn(),
  }
})

jest.mock('../hooks/useReleases', () => {
  const actual = jest.requireActual('../hooks/useReleases')
  return {
    ...actual,
    useCreateRelease: jest.fn(),
    useGenerateRelease: jest.fn(),
    usePublishRelease: jest.fn(),
  }
})

const mockCreatePerson = jest.fn().mockImplementation((p: any) =>
  Promise.resolve({ data: { id: 'p-custom', displayName: p.displayName, bio: p.bio } }),
)

jest.mock('../hooks/usePersonSelector', () => ({
  usePersonSelector: () => ({
    people: [
      { id: 'p-custom-1', displayName: 'Grace Hopper', bio: 'Computer pioneer' },
    ],
    isLoading: false,
    createPerson: mockCreatePerson,
    isCreating: false,
  }),
}))

jest.mock('@/modules/media/useUnifiedMediaLibrary', () => ({
  useUnifiedMediaLibrary: () => ({
    allMedia: [{ id: 'art-1', url: 'https://example.com/art.jpg', label: 'Preset', source: 'CURATED' }],
    userLibrary: [],
    curatedPresets: [],
    profileGallery: [],
    isLoading: false,
    registerUploadedMedia: jest.fn(),
  }),
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

const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}))

describe('RARE Card Studio — Canonical Person Publication Tests', () => {
  const mockCreate = jest.fn()
  const mockUpdate = jest.fn()
  const mockCreateRelease = jest.fn()
  const mockGenerateRelease = jest.fn()
  const mockPublishRelease = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useStudioUser as jest.Mock).mockReturnValue({
      user: { id: 'u1', username: 'testcreator' },
      username: 'testcreator',
      isLoggedIn: true,
      isLoading: false,
    })

    mockCreate.mockResolvedValue({
      id: 'design-new',
      revision: 1,
      title: 'Untitled Collectible',
      composition: {
        schemaVersion: 1,
        canvas: { width: 600, height: 900 },
        layers: [],
        metadata: {
          flagship: {
            id: 'classic-collector',
            contentStore: {},
          },
        },
      },
    })
    ;(useCreateCardDesign as jest.Mock).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    })

    mockUpdate.mockResolvedValue({
      id: 'design-new',
      revision: 2,
      title: 'Untitled Collectible',
      composition: {
        schemaVersion: 1,
        canvas: { width: 600, height: 900 },
        layers: [],
        metadata: {
          flagship: {
            id: 'classic-collector',
            contentStore: {},
          },
        },
      },
    })
    ;(useUpdateCardDesign as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    })

    ;(useCardDesigns as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    })

    mockCreateRelease.mockResolvedValue({ id: 'release-123' })
    ;(useCreateRelease as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateRelease,
      isPending: false,
    })

    mockGenerateRelease.mockResolvedValue({ id: 'release-123', status: 'COMPLETED' })
    ;(useGenerateRelease as jest.Mock).mockReturnValue({
      mutateAsync: mockGenerateRelease,
      isPending: false,
    })

    mockPublishRelease.mockResolvedValue({ id: 'release-123', visibility: 'PUBLIC' })
    ;(usePublishRelease as jest.Mock).mockReturnValue({
      mutateAsync: mockPublishRelease,
      isPending: false,
    })
  })

  afterEach(async () => {
    await cleanup()
  })

  // 10. Publishing with canonical person ID from loaded draft
  it('publishes using canonical person ID when activeProfile is present', async () => {
    const savedDraft = {
      id: 'saved-draft-canonical',
      title: 'Canonical Subject Draft',
      revision: 1,
      composition: {
        schemaVersion: 1,
        canvas: { width: 600, height: 900 },
        layers: [],
        metadata: {
          flagship: {
            id: 'classic-collector',
            cardTypeId: 'standard',
            contentStore: {
              input1: 'Grace Hopper',
            },
            profile: {
              id: 'person-canonical-42',
              displayName: 'Grace Hopper',
            },
          },
        },
      },
    }

    ;(useCardDesigns as jest.Mock).mockReturnValue({
      data: [savedDraft],
      isLoading: false,
    })

    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('saved-designs-dropdown')).toBeTruthy()
    })

    fireEvent.press(screen.getByTestId('saved-designs-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('saved-design-saved-draft-canonical')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('saved-design-saved-draft-canonical'))

    // Open publish drawer
    await waitFor(() => {
      expect(screen.getByTestId('publish-release-button')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('publish-release-button'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-publish-button')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('confirm-publish-button'))

    await waitFor(() => {
      expect(mockCreateRelease).toHaveBeenCalledWith(
        expect.objectContaining({
          personProfileId: 'person-canonical-42',
        })
      )
    })
  })
})
