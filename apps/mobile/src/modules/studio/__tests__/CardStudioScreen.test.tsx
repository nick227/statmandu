import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
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
  useUnifiedMediaLibrary: () => {
    const curated = [
      { id: 'art-angelou', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80', label: 'Maya Angelou', source: 'CURATED' },
      { id: 'art-miles', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', label: 'Miles Davis', source: 'CURATED' },
    ]
    return {
      allMedia: curated,
      userLibrary: [],
      curatedPresets: curated,
      profileGallery: [],
      isLoading: false,
      registerUploadedMedia: jest.fn((item: any) => ({ ...item, source: 'USER_LIBRARY' })),
    }
  },
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

describe('CardStudioScreen', () => {
  const mockCreate = jest.fn()
  const mockUpdate = jest.fn()
  const mockCreateRelease = jest.fn()
  const mockGenerateRelease = jest.fn()
  const mockPublishRelease = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStudioUser as jest.Mock).mockReturnValue({
      user: { id: 'u1' },
      username: 'testcreator',
      isLoading: false,
    })
    ;(useCardDesigns as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'design-saved-1',
          title: 'Saved Jazz Master',
          revision: 3,
          composition: {
            schemaVersion: 1,
            canvas: { width: 600, height: 900 },
            layers: [],
            metadata: {
              flagship: {
                id: 'prestige-gold',
                cardTypeId: 'achievement',
                selectedImageId: 'art-miles',
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

  it('renders simplified studio layout with Subject selector, Card Type above, Content in middle, Design below, and Unified Media Library', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('card-composition-renderer')).toBeTruthy()
      expect(screen.getByPlaceholderText('Design title...')).toBeTruthy()
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
      expect(screen.getByTestId('card-type-dropdown')).toBeTruthy()
      expect(screen.getByText('Content Fields')).toBeTruthy()
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
      expect(screen.getByTestId('design-picker-dropdown')).toBeTruthy()
      expect(screen.getByText(/Card Artwork/)).toBeTruthy()
      expect(screen.getByTestId('artwork-option-art-angelou')).toBeTruthy()
      expect(screen.getByTestId('saved-designs-dropdown')).toBeTruthy()
    })

    // Legacy modals / elements cut
    expect(screen.queryByText('Select Subject')).toBeNull()
    expect(screen.queryByText('Designs')).toBeNull()
    expect(screen.queryByText(/Canvas 600/)).toBeNull()
    expect(screen.queryByTestId('mode-flagship-button')).toBeNull()
  })

  it('links content fields to selected subject profile attributes', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('person-selector-dropdown')).toBeTruthy()
    })

    // Open subject selector
    fireEvent.press(screen.getByTestId('person-selector-dropdown'))

    await waitFor(() => {
      expect(screen.getByTestId('benchmark-person-miles-davis')).toBeTruthy()
    })

    // Select Miles Davis
    fireEvent.press(screen.getByTestId('benchmark-person-miles-davis'))

    await waitFor(() => {
      // Content slot 1 automatically linked to Miles Davis
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
      // Content slot 2 automatically linked to JAZZ · MUSICIAN
      expect(screen.getByTestId('slot-input2').props.value).toBe('JAZZ · MUSICIAN')
    })
  })

  it('allows overriding a linked field and re-linking back to profile value', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Edit input1 with custom override text
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Custom Override Name')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Custom Override Name')
      // Override indicator and re-link button appear
      expect(screen.getByTestId('relink-input1')).toBeTruthy()
    })

    // Click Re-link button
    fireEvent.press(screen.getByTestId('relink-input1'))

    await waitFor(() => {
      // Re-linked back to active profile's displayName!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Maya Angelou')
      expect(screen.queryByTestId('relink-input1')).toBeNull()
    })
  })

  it('preserves content when switching designs using the dropdown', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Edit slot 1
    const slotInput1 = screen.getByTestId('slot-input1')
    fireEvent.changeText(slotInput1, 'Miles Davis')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })

    // Open design dropdown
    fireEvent.press(screen.getByTestId('design-picker-dropdown'))

    // Pick Prestige Gold
    await waitFor(() => {
      expect(screen.getByTestId('design-option-prestige-gold')).toBeTruthy()
    })
    fireEvent.press(screen.getByTestId('design-option-prestige-gold'))

    await waitFor(() => {
      // Content preserved!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })
  })

  it('supports selecting Card Types and preserves content across types', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1')).toBeTruthy()
    })

    // Edit input1 with custom text
    fireEvent.changeText(screen.getByTestId('slot-input1'), 'Nobel Peace Laureate')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Nobel Peace Laureate')
    })

    // Open Card Type dropdown
    fireEvent.press(screen.getByTestId('card-type-dropdown'))

    await waitFor(() => {
      expect(screen.getByTestId('card-type-option-achievement')).toBeTruthy()
    })

    // Select Achievement Card Type
    fireEvent.press(screen.getByTestId('card-type-option-achievement'))

    await waitFor(() => {
      // Content is preserved and not wiped!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Nobel Peace Laureate')
      expect(screen.queryByTestId('card-type-option-achievement')).toBeNull()
    })
  })

  it('supports selecting curated artwork presets from unified media library', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('artwork-option-art-miles')).toBeTruthy()
    })

    const milesPreset = screen.getByTestId('artwork-option-art-miles')
    fireEvent.press(milesPreset)

    await waitFor(() => {
      expect(screen.getByTestId('artwork-selected-art-miles')).toBeTruthy()
    })

    // Save design and verify selected artwork is preserved in flagship metadata
    fireEvent.press(screen.getByTestId('save-design-button'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          composition: expect.objectContaining({
            metadata: expect.objectContaining({
              flagship: expect.objectContaining({
                selectedImageId: 'art-miles',
              }),
            }),
          }),
        }),
      )
    })
  })

  it('filters unified media library by category tabs', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('media-tab-curated')).toBeTruthy()
    })

    // Click Curated tab
    fireEvent.press(screen.getByTestId('media-tab-curated'))

    await waitFor(() => {
      expect(screen.getByTestId('artwork-option-art-angelou')).toBeTruthy()
    })

    // Click User Library tab
    fireEvent.press(screen.getByTestId('media-tab-user'))

    await waitFor(() => {
      expect(screen.getByTestId('media-tab-user')).toBeTruthy()
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
})
