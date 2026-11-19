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

describe('RARE Card Studio — Publishing, Linkage & Integrity Tests', () => {
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

  // 7. Publishing validates real selected subject and required fields
  it('validates that a real selected subject is required for publishing', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('publish-release-button')).toBeTruthy()
    })

    // Open publish drawer on blank studio
    fireEvent.press(screen.getByTestId('publish-release-button'))
    await waitFor(() => {
      expect(screen.getByTestId('confirm-publish-button')).toBeTruthy()
    })

    // Confirm publish without any subject
    fireEvent.press(screen.getByTestId('confirm-publish-button'))

    await waitFor(() => {
      // Rejects publication with clear validation error
      expect(screen.getByText('A real selected subject is required for publication.')).toBeTruthy()
      expect(mockCreateRelease).not.toHaveBeenCalled()
    })
  })

  // 8. Release snapshot compilation contains only resolved values and no benchmark fallbacks
  it('compiles and publishes clean snapshot with no mock text in blank optional fields', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('publish-release-button')).toBeTruthy()
    })

    // Open publish drawer
    fireEvent.press(screen.getByTestId('publish-release-button'))
    await waitFor(() => {
      expect(screen.getByTestId('confirm-publish-button')).toBeTruthy()
      expect(screen.getByTestId('publish-subject-name-input')).toBeTruthy()
    })

    // Enter real subject Grace Hopper in publish drawer
    fireEvent.changeText(screen.getByTestId('publish-subject-name-input'), 'Grace Hopper')

    await waitFor(() => {
      expect(screen.getByTestId('publish-subject-name-input').props.value).toBe('Grace Hopper')
    })

    // Confirm publish
    fireEvent.press(screen.getByTestId('confirm-publish-button'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          composition: expect.objectContaining({
            metadata: expect.objectContaining({
              flagship: expect.objectContaining({
                contentStore: expect.objectContaining({
                  // Optional inputs are empty strings, NEVER benchmark fallbacks!
                  input4: '',
                }),
              }),
            }),
          }),
        }),
      )
      expect(mockCreateRelease).toHaveBeenCalled()
    })
  })

  // 9. Semantic override isolation: Role override does not leak into Stats Discipline
  it('does not leak template-specific overrides across card types and preserves them on return', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => expect(screen.getByTestId('category-content')).toBeTruthy())
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => {
      expect(screen.getByTestId('slot-input2')).toBeTruthy()
    })

    // In Standard, input2 is Role
    fireEvent.changeText(screen.getByTestId('slot-input2'), 'Master Architect')
    await waitFor(() => {
      expect(screen.getByTestId('slot-input2').props.value).toBe('Master Architect')
    })

    // Switch to Stats template (where input2 is Discipline / Category)
    fireEvent.press(screen.getByTestId('category-card'))
    await waitFor(() => expect(screen.getByTestId('card-type-dropdown')).toBeTruthy())
    fireEvent.press(screen.getByTestId('card-type-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-stats')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-option-stats'))

    await waitFor(() => expect(screen.getByTestId('category-content')).toBeTruthy())
    fireEvent.press(screen.getByTestId('category-content'))
    // Stats input2 must NOT be contaminated with "Master Architect"
    await waitFor(() => {
      expect(screen.getByTestId('slot-input2').props.value).not.toBe('Master Architect')
      expect(screen.getByTestId('slot-input2').props.value).toBe('')
    })

    // Switch back to Standard template
    fireEvent.press(screen.getByTestId('category-card'))
    await waitFor(() => expect(screen.getByTestId('card-type-dropdown')).toBeTruthy())
    fireEvent.press(screen.getByTestId('card-type-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-standard')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-option-standard'))

    // Preserved the manual Role override on return!
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => {
      expect(screen.getByTestId('slot-input2').props.value).toBe('Master Architect')
    })
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
