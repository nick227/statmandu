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
      data: [],
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

  it('renders simplified studio layout with content inputs on left, card on right, and design dropdown', async () => {
    const screen = await render(<CardStudioScreen />)

    expect(screen.getByTestId('card-composition-renderer')).toBeTruthy()
    expect(screen.getByPlaceholderText('Design title...')).toBeTruthy()
    expect(screen.getByText('Content')).toBeTruthy()

    // Dynamic inputs
    expect(screen.getByTestId('slot-input1')).toBeTruthy()
    expect(screen.getByTestId('slot-input2')).toBeTruthy()
    expect(screen.getByTestId('slot-input3')).toBeTruthy()

    // Design picker dropdown under content fields
    expect(screen.getByTestId('design-picker-dropdown')).toBeTruthy()

    // Action buttons
    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Publish Release')).toBeTruthy()

    // Legacy modals / elements cut
    expect(screen.queryByText('Select Subject')).toBeNull()
    expect(screen.queryByText('Designs')).toBeNull()
    expect(screen.queryByText(/Canvas 600/)).toBeNull()
    expect(screen.queryByTestId('mode-flagship-button')).toBeNull()
  })

  it('preserves content when switching designs using the dropdown', async () => {
    const screen = await render(<CardStudioScreen />)

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

  it('saves design with compiled flagship metadata', async () => {
    const screen = await render(<CardStudioScreen />)

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

  it('publishes release directly without modals and redirects to storefront', async () => {
    const screen = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('publish-release-button')).toBeTruthy()
    })
    const publishBtn = screen.getByTestId('publish-release-button')
    fireEvent.press(publishBtn)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
      expect(mockCreateRelease).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'design-new',
          editionMode: 'LIMITED',
          editionSize: 25,
        }),
      )
      expect(mockGenerateRelease).toHaveBeenCalledWith('release-123')
      expect(mockPublishRelease).toHaveBeenCalledWith('release-123')
      expect(mockPush).toHaveBeenCalledWith('/storefronts/testcreator')
    })
  })
})
