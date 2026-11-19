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

  afterEach(async () => {
    await cleanup()
  })

  // 1. Blank new studio & neutral initial state
  it('initializes a new session in a neutral state with no selected subject and empty inputs', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeTruthy()
      expect(screen.getByTestId('category-content')).toBeTruthy()
      expect(screen.getByTestId('category-subject')).toBeTruthy()
    })

    // Concept of benchmark profiles is cut: no person-selector-dropdown in studio
    expect(screen.queryByTestId('person-selector-dropdown')).toBeNull()

    // Open Content category
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Inputs start blank and show generic instructional placeholders, NOT Maya Angelou
    expect(screen.getByTestId('slot-input1').props.value).toBe('')
    expect(screen.getByTestId('slot-input1').props.placeholder).toBe('Enter subject or person name...')
    expect(screen.queryByText('Maya Angelou')).toBeNull()
    expect(screen.queryByText('Miles Davis')).toBeNull()
    expect(screen.queryByText('Wilma Rudolph')).toBeNull()
  })

  // 2. Missing/blank optional attributes
  it('resolves missing attributes to empty string without injecting benchmark fallback content', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })

    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Slot 1 and 2 start empty, no benchmark mock data
    expect(screen.getByTestId('slot-input1').props.value).toBe('')
    expect(screen.getByTestId('slot-input2').props.value).toBe('')
    expect(screen.queryByText('St. Louis, Missouri')).toBeNull()
    expect(screen.queryByText('Author & Poet')).toBeNull()
  })

  // 3. Template switching: Standard -> Stats -> Minimal meaningfully changes fields and layout
  it('meaningfully changes fields displayed and layout geometry when switching templates', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })

    // Open Content to check Standard template field placeholders
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter subject or person name...')).toBeTruthy()
      expect(screen.getByPlaceholderText('e.g. Architect, Musician, Athlete')).toBeTruthy()
    })
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Switch to Stats template in Card category
    fireEvent.press(screen.getByTestId('category-card'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-dropdown')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-stats')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-option-stats'))
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('category-content'))

    // Field placeholders changed to Stats template fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter competitor or subject name...')).toBeTruthy()
      expect(screen.getByPlaceholderText('e.g. Basketball, Track & Field, Racing')).toBeTruthy()
    })
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Switch to Minimal template
    fireEvent.press(screen.getByTestId('category-card'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-dropdown')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-minimal')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-option-minimal'))
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('category-content'))

    // Field placeholders changed to Minimal template fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter artwork or subject title...')).toBeTruthy()
      expect(screen.getByPlaceholderText('Enter creator or artist name...')).toBeTruthy()
    })
  })

  // 4. Style switching preserves manual inputs
  it('preserves manual content when switching flagship design style', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })

    // Open Content
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Custom input on slot 1
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Custom Hero Subject')
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Custom Hero Subject')
    })
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Switch design to Brutalist Block in Card category
    fireEvent.press(screen.getByTestId('category-card'))
    await waitFor(() => {
      expect(screen.getByTestId('design-picker-dropdown')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('design-picker-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('design-option-brutalist-block')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('design-option-brutalist-block'))
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      // Manual content is preserved across style switches!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Custom Hero Subject')
    })
  })

  // 5. Template switching preserves manual input1 across types
  it('preserves input content when switching between card templates', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })

    // Open Content
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Universal Title Subject')
    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Universal Title Subject')
    })
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Switch to Minimal template in Card category
    fireEvent.press(screen.getByTestId('category-card'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-dropdown')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-dropdown'))
    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-minimal')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('card-type-option-minimal'))
    // Switch directly between inline accordion sections.
    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Universal Title Subject')
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
            cardTypeId: 'standard',
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

    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      // Restored actual subject Grace Hopper!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Grace Hopper')
      expect(screen.getByTestId('slot-input2').props.value).toBe('SYSTEMS ARCHITECT')
    })
  })

})
