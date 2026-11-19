import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
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

describe('RARE Card Studio — Mock Data Contamination Removal Regression Tests', () => {
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

  // 1. Blank new studio
  it('initializes a new session in a neutral state with no selected subject and empty inputs', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Dropdown shows no selected subject
    expect(screen.getByText('Select Profile')).toBeTruthy()
    expect(screen.getByText('No subject selected')).toBeTruthy()

    // Inputs start blank and show generic instructional placeholders, NOT Maya Angelou
    expect(screen.getByTestId('slot-input1').props.value).toBe('')
    expect(screen.getByTestId('slot-input1').props.placeholder).toBe('Enter subject or person name...')
    expect(screen.queryByText('Maya Angelou')).toBeNull()
    expect(screen.queryByText('Miles Davis')).toBeNull()
    expect(screen.queryByText('Wilma Rudolph')).toBeNull()
  })

  // 2. Missing profile attributes
  it('resolves missing profile attributes to empty string without injecting benchmark fallback content', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
    })

    // Select custom person Grace Hopper (who only has displayName and bio)
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('custom-person-p-custom-1')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('custom-person-p-custom-1'))

    await waitFor(() => {
      // First obvious field (Name) is seamlessly bound
      expect(screen.getByTestId('slot-input1').props.value).toBe('Grace Hopper')
      // Missing title/calling is EMPTY, never "Author & Poet"
      expect(screen.getByTestId('slot-input2').props.value).toBe('')
      // Bio field is bound
      expect(screen.getByTestId('slot-input3').props.value).toBe('Computer pioneer')
      // Slot 4 is not mapped in classic-collector
      expect(screen.queryByTestId('slot-input4')).toBeNull()
      expect(screen.queryByText('St. Louis, Missouri')).toBeNull()
      expect(screen.queryByText('Author & Poet')).toBeNull()
    })
  })

  // 3. Subject switching & clean override isolation
  it('does not transfer overrides or linked values when switching subjects', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
    })

    // Select Miles Davis
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('benchmark-person-miles-davis')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('benchmark-person-miles-davis'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })

    // Override input 2
    fireEvent.changeText(screen.getByTestId('slot-input2'), 'Custom Jazz Fusion Master')
    await waitFor(() => {
      expect(screen.getByTestId('slot-input2').props.value).toBe('Custom Jazz Fusion Master')
      expect(screen.getByTestId('relink-input2')).toBeTruthy()
    })

    // Now switch subject to Maya Angelou
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('benchmark-person-maya-angelou')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('benchmark-person-maya-angelou'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Maya Angelou')
      // Overridden calling for Miles Davis is NOT transferred to Maya Angelou!
      expect(screen.getByTestId('slot-input2').props.value).toBe('POETRY · AUTHOR')
      expect(screen.queryByText('Custom Jazz Fusion Master')).toBeNull()
      // Override indicator is cleared
      expect(screen.queryByTestId('relink-input2')).toBeNull()
    })
  })

  // 4. Design switching preserves overrides for the same subject
  it('preserves manual overrides when switching flagship design for the same subject', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
    })

    // Select Miles Davis
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('benchmark-person-miles-davis')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('benchmark-person-miles-davis'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })

    // Custom override on slot 1
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Sir Miles Davis (Override)')
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Sir Miles Davis (Override)')
    })

    // Switch design to Brutalist Block
    fireEvent.press(screen.getByTestId('design-picker-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('design-option-brutalist-block')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('design-option-brutalist-block'))

    await waitFor(() => {
      // Manual override is preserved!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Sir Miles Davis (Override)')
    })
  })

  // 5. Manual override and re-link
  it('re-links an overridden field back to the current profile source value', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
    })

    // Select Wilma Rudolph
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('benchmark-person-wilma-rudolph')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('benchmark-person-wilma-rudolph'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Wilma Rudolph')
    })

    // Override
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Olympic Legend Wilma')
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Olympic Legend Wilma')
      expect(screen.getByTestId('relink-input1')).toBeTruthy()
    })

    // Re-link
    fireEvent.press(screen.getByTestId('relink-input1'))
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Wilma Rudolph')
      expect(screen.queryByTestId('relink-input1')).toBeNull()
    })
  })

  // 6. Draft save and reload restores actual subject
  it('restores the actual subject when loading a saved draft', async () => {
    const savedDraft = {
      id: 'saved-draft-1',
      title: 'Grace Hopper Draft',
      revision: 1,
      composition: {
        schemaVersion: 1,
        canvas: { width: 600, height: 900 },
        layers: [],
        metadata: {
          flagship: {
            id: 'classic-collector',
            cardTypeId: 'profile',
            contentStore: {
              input1: 'Grace Hopper',
              input2: 'SYSTEMS ARCHITECT',
            },
            profile: {
              id: 'p-custom-1',
              displayName: 'Grace Hopper',
              bio: 'Computer pioneer',
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

    // Open saved designs dropdown and select the draft
    fireEvent.press(screen.getByTestId('saved-designs-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('saved-design-saved-draft-1')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('saved-design-saved-draft-1'))

    await waitFor(() => {
      // Restored actual subject Grace Hopper!
      expect(screen.getByText('Grace Hopper')).toBeTruthy()
      expect(screen.getByTestId('slot-input1').props.value).toBe('Grace Hopper')
      expect(screen.getByTestId('slot-input2').props.value).toBe('SYSTEMS ARCHITECT')
    })
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
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
    })

    // Select custom person Grace Hopper
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('custom-person-p-custom-1')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('custom-person-p-custom-1'))

    // Open publish drawer
    fireEvent.press(screen.getByTestId('publish-release-button'))
    await waitFor(() => {
      expect(screen.getByTestId('confirm-publish-button')).toBeTruthy()
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
                  input1: 'Grace Hopper',
                  input3: 'Computer pioneer',
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
})
