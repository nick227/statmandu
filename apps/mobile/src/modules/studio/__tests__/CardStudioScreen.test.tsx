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

jest.mock('../hooks/usePersonSelector', () => ({
  usePersonSelector: () => ({
    people: [{ id: 'p1', displayName: 'Maya Angelou', bio: 'Author' }],
    isLoading: false,
    createPerson: jest.fn(),
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

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}))

describe('CardStudioScreen', () => {
  const mockCreate = jest.fn()
  const mockUpdate = jest.fn()

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
  })

  it('renders studio canvas with Flagship Designs and adaptive positional inputs by default', async () => {
    const screen = await render(<CardStudioScreen />)

    expect(screen.getByTestId('card-composition-renderer')).toBeTruthy()
    expect(screen.getByPlaceholderText('Design title...')).toBeTruthy()
    expect(screen.getByText('Flagship Design Collection')).toBeTruthy()

    // Flagship carousel cards
    expect(screen.getByTestId('flagship-design-card-classic-collector')).toBeTruthy()
    expect(screen.getByTestId('flagship-design-card-prestige-gold')).toBeTruthy()

    // 3 Positional inputs
    expect(screen.getByTestId('slot-input1')).toBeTruthy()
    expect(screen.getByTestId('slot-input2')).toBeTruthy()
    expect(screen.getByTestId('slot-input3')).toBeTruthy()

    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Publish Release')).toBeTruthy()
  })

  it('preserves positional inputs when switching between flagship designs', async () => {
    const screen = await render(<CardStudioScreen />)

    // Edit slot 1
    const slotInput1 = screen.getByTestId('slot-input1')
    fireEvent.changeText(slotInput1, 'Miles Davis')

    await waitFor(() => {
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })

    // Switch to Prestige Gold flagship design
    const prestigeCard = screen.getByTestId('flagship-design-card-prestige-gold')
    fireEvent.press(prestigeCard)

    await waitFor(() => {
      // Input value is preserved!
      expect(screen.getByTestId('slot-input1').props.value).toBe('Miles Davis')
    })
  })

  it('switches to 5D Recipe Studio mode and navigates dimensions', async () => {
    const screen = await render(<CardStudioScreen />)

    // Switch to 5D Recipes
    fireEvent.press(screen.getByTestId('mode-recipes-button'))

    await waitFor(() => {
      expect(screen.getByText('Design Recipe Studio')).toBeTruthy()
      expect(screen.getByTestId('dimension-tab-style')).toBeTruthy()
    })
  })

  it('toggles to Advanced Layers mode and allows adding layers', async () => {
    const screen = await render(<CardStudioScreen />)

    // Click mode toggle for Advanced Layers
    fireEvent.press(screen.getByTestId('mode-advanced-button'))

    await waitFor(() => {
      expect(screen.getByText('Add Text')).toBeTruthy()
      expect(screen.getByText('Add Shape')).toBeTruthy()
      expect(screen.getByText('Add Image')).toBeTruthy()
    })

    // Add a text layer in advanced mode
    fireEvent.press(screen.getByText('Add Text'))

    await waitFor(() => {
      expect(screen.getByText('New Text Layer')).toBeTruthy()
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

    fireEvent.press(screen.getByTestId('save-design-button'))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Conflict: This design was updated elsewhere. Your unsaved changes are preserved locally.',
        ),
      ).toBeTruthy()
    })

    expect(titleInput.props.value).toBe('Conflicted title local edit')
  })
})
