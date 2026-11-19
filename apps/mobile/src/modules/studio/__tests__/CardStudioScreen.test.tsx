import React from 'react'
import { render, fireEvent, waitFor, cleanup, act } from '@testing-library/react-native'
import { CardStudioScreen } from '../CardStudioScreen'
import { useStudioUser } from '../hooks/useStudioUser'
import {
  useCardDesigns,
  useCreateCardDesign,
  useUpdateCardDesign,
  RevisionConflictError,
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

jest.mock('../hooks/usePersonSelector', () => ({
  usePersonSelector: () => ({
    people: [{ id: 'p1', displayName: 'Maya Angelou', bio: 'Author' }],
    isLoading: false,
    createPerson: jest.fn().mockResolvedValue({ data: { id: 'p1', displayName: 'Maya Angelou' } }),
    isCreating: false,
  }),
}))

jest.mock('@/modules/media/useUnifiedMediaLibrary', () => ({
  useUnifiedMediaLibrary: () => ({
    allMedia: [
      { id: 'art-angelou', url: 'https://example.com/angelou.jpg', label: 'Angelou Portrait', source: 'CURATED' },
      { id: 'art-miles', url: 'https://example.com/miles.jpg', label: 'Miles Davis', source: 'CURATED' },
    ],
    userLibrary: [
      { id: 'user-art-1', url: 'https://example.com/user1.jpg', label: 'My Upload', source: 'USER_LIBRARY' },
    ],
    curatedPresets: [
      { id: 'art-angelou', url: 'https://example.com/angelou.jpg', label: 'Angelou Portrait', source: 'CURATED' },
      { id: 'art-miles', url: 'https://example.com/miles.jpg', label: 'Miles Davis', source: 'CURATED' },
    ],
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
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

// Studio integration renders are asynchronous and can exceed Jest's 5s default on CI.
jest.setTimeout(20_000)

describe('CardStudioScreen', () => {
  const mockCreate = jest.fn()
  const mockUpdate = jest.fn()
  const mockCreateRelease = jest.fn()
  const mockGenerateRelease = jest.fn()
  const mockPublishRelease = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStudioUser as jest.Mock).mockReturnValue({
      user: { id: 'usr-1', username: 'testcreator' },
      username: 'testcreator',
      profile: { displayName: 'Test Creator', hometown: 'Chicago' },
      isLoading: false,
    })
    ;(useCardDesigns as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'design-saved-1',
          title: 'Saved Jazz Master',
          revision: 2,
          composition: {
            schemaVersion: 1,
            canvas: { width: 600, height: 900 },
            layers: [],
            metadata: {
              flagship: {
                id: 'prestige-gold',
                cardTypeId: 'standard',
                contentStore: {
                  input1: 'Miles Dewey Davis III',
                  input2: 'Grammy Lifetime Achievement',
                },
              },
            },
          },
        },
      ],
      isLoading: false,
    })
    ;(useCreateCardDesign as jest.Mock).mockReturnValue({
      mutateAsync: mockCreate.mockResolvedValue({
        id: 'design-new',
        title: 'Untitled Collectible',
        revision: 1,
        composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] },
      }),
      isPending: false,
    })
    ;(useUpdateCardDesign as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdate.mockResolvedValue({
        id: 'design-new',
        title: 'Untitled Collectible',
        revision: 2,
        composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] },
      }),
      isPending: false,
    })
    ;(useCreateRelease as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateRelease.mockResolvedValue({
        id: 'release-123',
        templateId: 'design-new',
        title: 'Untitled Collectible',
      }),
      isPending: false,
    })
    ;(useGenerateRelease as jest.Mock).mockReturnValue({
      mutateAsync: mockGenerateRelease.mockResolvedValue({}),
      isPending: false,
    })
    ;(usePublishRelease as jest.Mock).mockReturnValue({
      mutateAsync: mockPublishRelease.mockResolvedValue({}),
      isPending: false,
    })
  })

  afterEach(async () => {
    await cleanup()
  })

  it('renders 4 inline expandable sections (Subject, Card, Content, Appearance) and live preview', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('card-composition-renderer')).toBeTruthy()
      expect(screen.getByPlaceholderText('Design title...')).toBeTruthy()
      expect(screen.getByTestId('category-subject')).toBeTruthy()
      expect(screen.getByTestId('category-card')).toBeTruthy()
      expect(screen.getByTestId('category-content')).toBeTruthy()
      expect(screen.getByTestId('category-appearance')).toBeTruthy()
      expect(screen.getByTestId('saved-designs-dropdown')).toBeTruthy()
    })

    // Legacy modals & benchmark profile selector cut
    expect(screen.queryByTestId('person-selector-dropdown')).toBeNull()
    expect(screen.queryByText('Select Subject')).toBeNull()
    expect(screen.queryByText(/Canvas 600/)).toBeNull()
  })

  it('allows overriding a field and retaining custom edits', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })

    // Expand Content section inline
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Edit input1 with custom text
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Custom Override Name')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Custom Override Name')
    })
  })

  it('preserves content when switching designs using the dropdown', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Expand Content and edit slot 1
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Miles Davis')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })

    // Expand Card section inline
    fireEvent.press(screen.getByTestId('category-card'))

    await waitFor(() => {
      expect(screen.getByTestId('design-picker-dropdown')).toBeTruthy()
    })

    // Open design dropdown
    fireEvent.press(screen.getByTestId('design-picker-dropdown'))

    // Pick Prestige Gold
    await waitFor(() => {
      expect(screen.getByTestId('design-option-prestige-gold')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('design-option-prestige-gold'))

    await waitFor(() => {
      expect(screen.queryByTestId('design-option-prestige-gold')).toBeNull()
    })

    // Content is preserved!
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis'))
  })

  it('supports selecting Card Types and preserves content across types', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Expand Content
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Edit input1 with custom text
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Nobel Peace Laureate')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Nobel Peace Laureate')
    })

    // Expand Card section
    fireEvent.press(screen.getByTestId('category-card'))

    await waitFor(() => {
      expect(screen.getByTestId('card-type-dropdown')).toBeTruthy()
    })

    // Open Card Type dropdown
    fireEvent.press(screen.getByTestId('card-type-dropdown'))

    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-stats')).toBeTruthy()
    })

    // Select Stats Card Type
    fireEvent.press(screen.getByTestId('card-type-option-stats'))

    await waitFor(() => {
      expect(screen.queryByTestId('card-type-option-stats')).toBeNull()
    })

    // Content is preserved and not wiped!
    fireEvent.press(screen.getByTestId('category-content'))
    await waitFor(() => expect(screen.getByTestId('slot-input1').props.value).toBe('Nobel Peace Laureate'))
  })

  it('supports selecting visual appearance treatments (Layout, Style, Finish)', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-appearance')).toBeTruthy()
    })

    // Expand Appearance inline
    fireEvent.press(screen.getByTestId('category-appearance'))

    await waitFor(() => {
      expect(screen.getByTestId('artwork-style-cinematic')).toBeTruthy()
      expect(screen.getByTestId('finish-effect-holographic')).toBeTruthy()
    })

    // Select Cinematic artwork style
    await React.act(async () => { fireEvent.press(screen.getByTestId('artwork-style-cinematic')) })
    await waitFor(() => expect(screen.getByTestId('artwork-style-cinematic').props.className).toContain('border-brand'))

    await waitFor(() => {
      expect(screen.getByTestId('finish-effect-holographic')).toBeTruthy()
    })

    // Select Holographic finish
    await React.act(async () => { fireEvent.press(screen.getByTestId('finish-effect-holographic')) })

    await waitFor(() => {
      expect(screen.getByTestId('save-design-button')).toBeTruthy()
    })

    // Save design and verify selected appearance is preserved in metadata
    fireEvent.press(screen.getByTestId('save-design-button'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          composition: expect.objectContaining({
            metadata: expect.objectContaining({
              flagship: expect.objectContaining({
                appearance: expect.objectContaining({
                  artworkStyle: 'cinematic',
                  finishEffect: 'holographic',
                }),
              }),
            }),
          }),
        }),
      )
      expect(screen.getByText('Saved')).toBeTruthy()
    })
  })

  it('restores loading and editing existing saved designs from library', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('saved-designs-dropdown')).toBeTruthy()
    })

    // Open saved designs dropdown
    fireEvent.press(screen.getByTestId('saved-designs-dropdown'))

    await waitFor(() => {
      expect(screen.getByTestId('saved-design-design-saved-1')).toBeTruthy()
    })

    // Click saved design
    fireEvent.press(screen.getByTestId('saved-design-design-saved-1'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Design title...').props.value).toBe('Saved Jazz Master')
    })

    // Expand Content panel to check loaded content
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Dewey Davis III')
    })
  })

  it('saves design with compiled flagship metadata', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('save-design-button')).toBeTruthy()
    })

    const saveBtn = screen.getByTestId('save-design-button')
    fireEvent.press(saveBtn)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Untitled Collectible',
          composition: expect.objectContaining({
            schemaVersion: 1,
            canvas: { width: 600, height: 900 },
            metadata: expect.objectContaining({
              rendererVersion: 'rdc-composition-v1',
              flagship: expect.objectContaining({
                id: expect.any(String),
                cardTypeId: expect.any(String),
                inputs: expect.any(Object),
                fittedFontSizes: expect.any(Object),
              }),
            }),
          }),
        }),
      )
      expect(screen.getByText('Saved')).toBeTruthy()
    })
  })

  it('handles 409 conflict during save and preserves local edits', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('save-design-button')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('save-design-button'))

    await waitFor(() => {
      expect(screen.getByText('v1')).toBeTruthy()
    })

    mockUpdate.mockRejectedValueOnce(
      new RevisionConflictError(
        'Conflict: This design was updated elsewhere. Your unsaved changes are preserved locally.',
      ),
    )

    const titleInput = screen.getByPlaceholderText('Design title...')
    fireEvent.changeText(titleInput, 'Conflicted title local edit')

    await waitFor(() => {
      expect(titleInput.props.value).toBe('Conflicted title local edit')
    })

    fireEvent.press(screen.getByTestId('save-design-button'))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Conflict: This design was updated elsewhere. Your unsaved changes are preserved locally.',
        ),
      ).toBeTruthy()
    })
  })

  it('configures explicit subject and edition in lightweight inline publishing drawer', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('publish-release-button')).toBeTruthy()
    })

    // 1. Click Publish Release in top bar to toggle inline drawer
    const publishBtn = screen.getByTestId('publish-release-button')
    fireEvent.press(publishBtn)

    // Inline publishing drawer opens without heavy popup modals
    await waitFor(() => {
      expect(screen.getByTestId('inline-publish-drawer')).toBeTruthy()
      expect(screen.getByTestId('publish-subject-name-input')).toBeTruthy()
      expect(screen.getByTestId('edition-mode-limited')).toBeTruthy()
      expect(screen.getByTestId('publish-edition-size-input')).toBeTruthy()
    })

    // Edit explicit subject name
    fireEvent.changeText(screen.getByTestId('publish-subject-name-input'), 'Wilma Rudolph')

    await waitFor(() => {
      expect(screen.getByTestId('publish-subject-name-input').props.value).toBe('Wilma Rudolph')
    })

    // Edit edition size
    fireEvent.changeText(screen.getByTestId('publish-edition-size-input'), '50')

    await waitFor(() => {
      expect(screen.getByTestId('publish-edition-size-input').props.value).toBe('50')
    })

    // Confirm & publish
    const confirmBtn = screen.getByTestId('confirm-publish-button')
    fireEvent.press(confirmBtn)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
      expect(mockCreateRelease).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'design-new',
          editionMode: 'LIMITED',
          editionSize: 50,
          sourceImageAssetId: expect.any(String),
        }),
      )
      expect(mockGenerateRelease).toHaveBeenCalledWith('release-123')
      expect(mockPublishRelease).toHaveBeenCalledWith({ releaseId: 'release-123', visibility: 'PUBLIC' })
      expect(mockPush).toHaveBeenCalledWith('/storefronts/testcreator')
    })
  })

  it('supports selecting flagship designs via the dropdown in Card section', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeTruthy()
    })

    // Expand Card section
    fireEvent.press(screen.getByTestId('category-card'))

    await waitFor(() => {
      expect(screen.getByTestId('design-picker-dropdown')).toBeTruthy()
    })

    // Open dropdown and pick Editorial Broadsheet
    fireEvent.press(screen.getByTestId('design-picker-dropdown'))

    await waitFor(() => {
      expect(screen.getByTestId('design-option-editorial-broadsheet')).toBeTruthy()
    })

    fireEvent.press(screen.getByTestId('design-option-editorial-broadsheet'))

    await waitFor(() => {
      expect(screen.getAllByText('Editorial').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('does not display unmapped fields or confusing Preserved badge in content editor', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('category-content')).toBeTruthy()
    })

    // Expand Content section
    fireEvent.press(screen.getByTestId('category-content'))

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Content editor should never display the word "Preserved"
    expect(screen.queryByText('Preserved')).toBeNull()
  })
})
