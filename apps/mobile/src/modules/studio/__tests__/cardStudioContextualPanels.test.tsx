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

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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
    people: [],
    isLoading: false,
    createPerson: mockCreatePerson,
    isCreating: false,
  }),
}))

jest.mock('@/modules/media/useUnifiedMediaLibrary', () => ({
  useUnifiedMediaLibrary: () => ({
    allMedia: [{ id: 'art-1', url: 'https://example.com/art.jpg', label: 'Preset', source: 'CURATED' }],
    userLibrary: [],
    curatedPresets: [{ id: 'art-1', url: 'https://example.com/art.jpg', label: 'Preset', source: 'CURATED' }],
    profileGallery: [],
    isLoading: false,
    registerUploadedMedia: jest.fn(),
    pickAndUploadMedia: jest.fn(),
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

describe('RARE Card Studio — 4 Inline Expandable Sections & Live Preview', () => {
  const mockUseStudioUser = useStudioUser as jest.Mock
  const mockUseCardDesigns = useCardDesigns as jest.Mock
  const mockUseCreateCardDesign = useCreateCardDesign as jest.Mock
  const mockUseUpdateCardDesign = useUpdateCardDesign as jest.Mock
  const mockUseCreateRelease = useCreateRelease as jest.Mock
  const mockUseGenerateRelease = useGenerateRelease as jest.Mock
  const mockUsePublishRelease = usePublishRelease as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseStudioUser.mockReturnValue({
      user: { id: 'usr-1', username: 'elena' },
      username: 'elena',
      profile: {
        id: 'usr-1',
        displayName: 'Elena Rostova',
        username: 'elena',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'Digital artist & collector',
        hometown: 'Berlin',
      },
      isLoading: false,
    })

    mockUseCardDesigns.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    })

    mockUseCreateCardDesign.mockReturnValue({
      mutateAsync: jest.fn().mockImplementation((payload) =>
        Promise.resolve({
          id: 'design-new-1',
          userId: 'usr-1',
          title: payload.title,
          revision: 1,
          composition: payload.composition,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
      isPending: false,
    })

    mockUseUpdateCardDesign.mockReturnValue({
      mutateAsync: jest.fn().mockImplementation((payload) =>
        Promise.resolve({
          id: payload.designId,
          userId: 'usr-1',
          title: payload.title,
          revision: payload.expectedRevision + 1,
          composition: payload.composition,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
      isPending: false,
    })

    mockUseCreateRelease.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ id: 'rel-12345678' }),
      isPending: false,
    })

    mockUseGenerateRelease.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
    })

    mockUsePublishRelease.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders 4 inline accordion headers (Subject, Card, Content, Appearance) and live preview stage', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('category-subject')).toBeTruthy()
      expect(utils.getByTestId('category-card')).toBeTruthy()
      expect(utils.getByTestId('category-content')).toBeTruthy()
      expect(utils.getByTestId('category-appearance')).toBeTruthy()
    })

    // Top branding
    expect(utils.getByText('RARE / Card Studio')).toBeTruthy()

    // Fixed live card canvas preview on the right
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()
  })

  it('expands Subject inline: supports 1-click creator profile and background removal cutout toggle', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('category-subject')).toBeTruthy()
    })

    // Expand Subject section inline
    fireEvent.press(utils.getByTestId('category-subject'))

    await waitFor(() => {
      expect(utils.getByTestId('use-my-profile-button')).toBeTruthy()
      expect(utils.getByTestId('subject-name-input')).toBeTruthy()
      expect(utils.getByTestId('remove-background-button')).toBeTruthy()
    })

    // Zero seeded mock athletes (Nasir Alston, Josiah Davis) in studio
    expect(utils.queryByText('Nasir Alston')).toBeNull()
    expect(utils.queryByText('Josiah Davis')).toBeNull()

    // 1-Click "Use My Profile"
    fireEvent.press(utils.getByTestId('use-my-profile-button'))

    await waitFor(() => {
      expect(utils.getAllByText('Elena Rostova').length).toBeGreaterThanOrEqual(1)
      expect(utils.getByTestId('unlink-subject-button')).toBeTruthy()
    })

    // Priority Background Removal
    fireEvent.press(utils.getByTestId('remove-background-button'))

    await waitFor(() => {
      expect(utils.getByTestId('subject-image-type-cutout')).toBeTruthy()
      expect(utils.getByTestId('subject-image-type-original')).toBeTruthy()
    })

    // 1-click toggle between Cutout and Original
    fireEvent.press(utils.getByTestId('subject-image-type-original'))
    await waitFor(() => {
      expect(utils.getByTestId('subject-image-type-original')).toBeTruthy()
    })

    fireEvent.press(utils.getByTestId('subject-image-type-cutout'))
    await waitFor(() => {
      expect(utils.getByTestId('subject-image-type-cutout')).toBeTruthy()
    })

    // Card canvas remains continuously mounted
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()
  })

  it('expands Card and Content inline without leaving the workspace', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('category-card')).toBeTruthy()
      expect(utils.getByTestId('category-content')).toBeTruthy()
    })

    // Expand Card section inline
    fireEvent.press(utils.getByTestId('category-card'))

    await waitFor(() => {
      expect(utils.getByTestId('card-type-dropdown')).toBeTruthy()
      expect(utils.getByTestId('design-picker-dropdown')).toBeTruthy()
    })

    // Expand Content section inline
    fireEvent.press(utils.getByTestId('category-content'))

    await waitFor(() => {
      expect(utils.getByTestId('slot-input1')).toBeTruthy()
    })

    // Edit input1 directly
    fireEvent.changeText(utils.getByTestId('slot-input1'), 'New Collectible Headline')
    await waitFor(() => {
      expect(utils.getByTestId('slot-input1').props.value).toBe('New Collectible Headline')
    })

    // Card canvas remains visible
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()
  })

  it('expands Appearance inline with cohesive visual selections (Layout, Typography, Colors, Style, Finish)', async () => {
    const utils = await render(<CardStudioScreen />)

    await waitFor(() => {
      expect(utils.getByTestId('category-appearance')).toBeTruthy()
    })

    // Expand Appearance inline
    fireEvent.press(utils.getByTestId('category-appearance'))

    await waitFor(() => {
      // 1. Layout Variants
      expect(utils.getByTestId('layout-variant-portrait')).toBeTruthy()
      expect(utils.getByTestId('layout-variant-balanced')).toBeTruthy()
      expect(utils.getByTestId('layout-variant-editorial')).toBeTruthy()

      // 2. Typography Pairings
      expect(utils.getByTestId('font-role-serif')).toBeTruthy()
      expect(utils.getByTestId('font-role-sans')).toBeTruthy()

      // 3. Coordinated Color Palettes
      expect(utils.getByTestId('color-preset-obsidian')).toBeTruthy()
      expect(utils.getByTestId('color-preset-gold')).toBeTruthy()

      // 4. Artwork Treatment Style
      expect(utils.getByTestId('artwork-style-photographic')).toBeTruthy()
      expect(utils.getByTestId('artwork-style-cinematic')).toBeTruthy()

      // 5. Decorative Finishes
      expect(utils.getByTestId('finish-effect-matte')).toBeTruthy()
      expect(utils.getByTestId('finish-effect-holographic')).toBeTruthy()
    })

    // Verify technical border controls (border-width-0, border-width-4) are NOT exposed
    expect(utils.queryByTestId('border-width-0')).toBeNull()
    expect(utils.queryByTestId('border-width-4')).toBeNull()

    // Select Portrait layout
    fireEvent.press(utils.getByTestId('layout-variant-portrait'))

    // Select Cinematic style
    fireEvent.press(utils.getByTestId('artwork-style-cinematic'))

    // Select Holographic finish
    fireEvent.press(utils.getByTestId('finish-effect-holographic'))

    // Live card canvas remains continuously rendered
    expect(utils.getByTestId('card-preview-stage')).toBeTruthy()
  })
})
