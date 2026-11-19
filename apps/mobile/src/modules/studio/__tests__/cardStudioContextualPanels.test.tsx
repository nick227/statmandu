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
      { id: 'person-test-1', displayName: 'Miles Davis', bio: 'Legendary trumpeter' },
      { id: 'person-test-2', displayName: 'Wilma Rudolph', bio: 'Olympic champion' },
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

describe('RARE Card Studio — Single View & 3-Level Contextual Left Panel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStudioUser as jest.Mock).mockReturnValue({
      user: { id: 'u1', username: 'testcreator' },
      username: 'testcreator',
      isLoggedIn: true,
      isLoading: false,
    })
    ;(useCreateCardDesign as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: 'd-1', revision: 1 }),
      isPending: false,
    })
    ;(useUpdateCardDesign as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: 'd-1', revision: 2 }),
      isPending: false,
    })
    ;(useCardDesigns as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    })
    ;(useCreateRelease as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: 'rel-1' }),
      isPending: false,
    })
    ;(useGenerateRelease as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
    })
    ;(usePublishRelease as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders initial state with Subject as Independent and full card preview canvas continuously visible', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('card-type-dropdown')).toBeTruthy()
      expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
    })

    // Verify Subject category card shows Independent
    expect(utils.getByText('Independent')).toBeTruthy()
    expect(utils.getByText('Original Creative Work')).toBeTruthy()

    // Verify Level 1 categories are visible
    expect(utils.getByTestId('card-type-dropdown')).toBeTruthy()
    expect(utils.getByTestId('design-picker-dropdown')).toBeTruthy()
    expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
    expect(utils.getByTestId('open-artwork-adjust-button')).toBeTruthy()

    // Verify Card Stage canvas is rendered
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()
  })

  it('supports attaching and unlinking a subject with Subject vs Card separation', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('select-subject-button')).toBeTruthy()
    })

    // Initial state is Independent
    expect(utils.getByText('Independent')).toBeTruthy()

    // Open subject dropdown
    fireEvent.press(utils.getByTestId('select-subject-button'))

    // Select Miles Davis
    await waitFor(() => {
      expect(utils.getByTestId('subject-option-person-test-1')).toBeTruthy()
    })
    fireEvent.press(utils.getByTestId('subject-option-person-test-1'))

    // Subject is now Linked
    await waitFor(() => {
      expect(utils.getByText('Linked')).toBeTruthy()
      expect(utils.getByText('Miles Davis')).toBeTruthy()
    })

    // Content fields receive profile data
    expect(utils.getByDisplayValue('Miles Davis')).toBeTruthy()

    // Card canvas remains continuously rendered
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()

    // Unlink subject
    fireEvent.press(utils.getByTestId('unlink-subject-button'))

    // Switches back to Independent without destroying the card canvas
    await waitFor(() => {
      expect(utils.getByText('Independent')).toBeTruthy()
    })
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()
  })

  it('navigates the 3-level left panel hierarchy with back button and breadcrumbs', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
    })

    // 1. Navigate from Level 1 to Level 2 (Appearance groups)
    fireEvent.press(utils.getByTestId('open-appearance-button'))

    // Level 2 should now display property groups: Layout, Typography, Colors, Framing, Effects
    await waitFor(() => {
      expect(utils.getByTestId('appearance-group-typography')).toBeTruthy()
      expect(utils.getByTestId('appearance-group-colors')).toBeTruthy()
      expect(utils.getByTestId('appearance-group-framing')).toBeTruthy()
      expect(utils.getByTestId('appearance-group-effects')).toBeTruthy()
    })

    // Card canvas is still continuously mounted and visible
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()

    // Header displays back button
    expect(utils.getByTestId('panel-back-button')).toBeTruthy()

    // 2. Navigate from Level 2 to Level 3 (Typography Granular Controls)
    fireEvent.press(utils.getByTestId('appearance-group-typography'))

    await waitFor(() => {
      expect(utils.getByTestId('font-role-serif')).toBeTruthy()
      expect(utils.getByTestId('font-role-sans')).toBeTruthy()
      expect(utils.getByTestId('font-role-mono')).toBeTruthy()
      expect(utils.getByTestId('font-role-display')).toBeTruthy()
    })

    // Selecting a font role applies it to appearance without navigation away
    fireEvent.press(utils.getByTestId('font-role-serif'))
    await waitFor(() => {
      expect(utils.getByTestId('font-role-serif')).toBeTruthy()
    })
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()

    // 3. Test Back Navigation from Level 3 to Level 2
    fireEvent.press(utils.getByTestId('panel-back-button'))

    await waitFor(() => {
      expect(utils.getAllByText('Appearance').length).toBeGreaterThanOrEqual(1)
      expect(utils.getByTestId('appearance-group-typography')).toBeTruthy()
    })

    // 4. Test Back Navigation from Level 2 to Level 1
    fireEvent.press(utils.getByTestId('panel-back-button'))

    await waitFor(() => {
      expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
      expect(utils.getByTestId('card-type-dropdown')).toBeTruthy()
    })
  })

  it('allows direct breadcrumb jump back to Level 1 Studio from Level 3', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
    })

    // Open Appearance (Level 2)
    fireEvent.press(utils.getByTestId('open-appearance-button'))

    // Open Colors (Level 3)
    await waitFor(() => {
      expect(utils.getByTestId('appearance-group-colors')).toBeTruthy()
    })
    fireEvent.press(utils.getByTestId('appearance-group-colors'))

    await waitFor(() => {
      expect(utils.getByTestId('color-preset-obsidian')).toBeTruthy()
      expect(utils.getByTestId('color-preset-gold')).toBeTruthy()
    })

    // Select Gold palette preset
    fireEvent.press(utils.getByTestId('color-preset-gold'))
    await waitFor(() => {
      expect(utils.getByTestId('color-preset-gold')).toBeTruthy()
    })

    // Jump directly to Studio using breadcrumb button
    const studioBreadcrumb = utils.getByTestId('breadcrumb-studio')
    expect(studioBreadcrumb).toBeTruthy()
    fireEvent.press(studioBreadcrumb)

    // Should be at Level 1 immediately
    await waitFor(() => {
      expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
      expect(utils.getByTestId('card-type-dropdown')).toBeTruthy()
    })
  })

  it('supports direct Level 3 Artwork Framing adjustments', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('open-artwork-adjust-button')).toBeTruthy()
    })

    // Click Adjust Framing on Level 1
    fireEvent.press(utils.getByTestId('open-artwork-adjust-button'))

    // Enters Level 3 Artwork Framing
    await waitFor(() => {
      expect(utils.getByText('Artwork Framing')).toBeTruthy()
    })

    // Canvas remains continuously mounted
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()

    // Back button returns to Level 1
    fireEvent.press(utils.getByTestId('panel-back-button'))

    await waitFor(() => {
      expect(utils.getByTestId('open-appearance-button')).toBeTruthy()
    })
  })
})
