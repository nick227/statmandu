import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { AccountScreen } from '../AccountScreen'
import { useAccountSession } from '../useAccountSession'

jest.mock('../useAccountSession', () => ({
  useAccountSession: jest.fn(),
}))

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

jest.mock('@/shared/ui/Button', () => ({
  Button: ({
    children,
    onPress,
    isLoading,
    testID,
  }: {
    children: React.ReactNode
    onPress?: () => void
    isLoading?: boolean
    testID?: string
  }) => {
    const { Pressable, Text } = require('react-native')
    return (
      <Pressable testID={testID} accessibilityRole="button" onPress={onPress}>
        <Text>{isLoading ? 'Loading...' : children}</Text>
      </Pressable>
    )
  },
}))

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('AccountScreen - Profile Screen with Single Word Headings & Media', () => {
  const mockUser = {
    id: 'user-1',
    email: 'creator@rare.com',
    profile: {
      displayName: 'Alex Designer',
      username: 'alexdesigns',
      avatarUrl: null,
      hometown: 'New York, NY',
      bio: 'Digital product architect and vintage card collector.',
    },
    role: 'USER',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAccountSession as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isError: false,
      logout: { mutateAsync: jest.fn(), isPending: false },
    })
  })

  it('renders single word headings, clickable avatar upload, and primary Creator fields', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    // Identity header
    expect(screen.getAllByText('Alex Designer').length).toBeGreaterThanOrEqual(1)

    // Avatar is clickable for file upload
    const avatarButton = screen.getByTestId('avatar-upload-button')
    expect(avatarButton).toBeTruthy()

    // Test clicking avatar opens image picker
    ;(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file://new-avatar.jpg' }],
    })
    await fireEvent.press(avatarButton)
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled()

    // Single-word headings: Details, Identity, Bio
    expect(screen.getByText('Details')).toBeTruthy()
    expect(screen.getByText('Identity')).toBeTruthy()
    expect(screen.getAllByText('Bio').length).toBeGreaterThanOrEqual(1)

    // Prime fields under Creator
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Location')).toBeTruthy()
    expect(screen.getByText('Age')).toBeTruthy()
    expect(screen.getByText('Calling')).toBeTruthy()
    expect(screen.getByDisplayValue('Alex Designer')).toBeTruthy()
    expect(screen.getByDisplayValue('New York, NY')).toBeTruthy()
    expect(screen.getByDisplayValue('Digital product architect and vintage card collector.')).toBeTruthy()

    // Single-word save button
    expect(screen.getByText('Save')).toBeTruthy()

    // Media section: Single word heading "Media", and "All"/"Presets" tabs are cut
    expect(screen.getByText('Media')).toBeTruthy()
    expect(screen.queryByText('All')).toBeNull()
    expect(screen.queryByText('Presets')).toBeNull()
    expect(screen.getAllByText('Upload').length).toBeGreaterThanOrEqual(1)
  })

  it('keeps Bio on Creator tab only, switching to other chips hides Bio', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    // On Creator tab: Bio and Identity are visible
    expect(screen.getByText('Identity')).toBeTruthy()
    expect(screen.getByTestId('field-bio')).toBeTruthy()

    // Switch to Athlete chip
    await fireEvent.press(screen.getByTestId('chip-athlete'))

    // Athlete fields appear under single-word heading
    expect(screen.getAllByText('Athlete').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Sport')).toBeTruthy()
    expect(screen.getByText('Role')).toBeTruthy()
    expect(screen.getByText('Statistic')).toBeTruthy()
    expect(screen.getByText('Accolades')).toBeTruthy()

    // Bio and Identity are NOT persistent across other chips
    expect(screen.queryByTestId('field-bio')).toBeNull()
    expect(screen.queryByText('Identity')).toBeNull()
  })

  it('allows editing general fields and saving profile', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    const nameInput = screen.getByTestId('field-name')
    fireEvent.changeText(nameInput, 'Alex Morgan Chen')
    await waitFor(() => {
      expect(screen.getByDisplayValue('Alex Morgan Chen')).toBeTruthy()
    })

    const locationInput = screen.getByTestId('field-location')
    fireEvent.changeText(locationInput, 'San Francisco, CA')
    await waitFor(() => {
      expect(screen.getByDisplayValue('San Francisco, CA')).toBeTruthy()
    })

    const ageInput = screen.getByTestId('field-age')
    fireEvent.changeText(ageInput, '29')
    await waitFor(() => {
      expect(screen.getByDisplayValue('29')).toBeTruthy()
    })

    // Save action
    await fireEvent.press(screen.getByText('Save'))
    await waitFor(() => {
      expect(screen.getByText('✓ Saved')).toBeTruthy()
    })
  })

  it('allows adding and removing custom card fields cleanly without mock defaults', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    // Starts clean with no pre-filled mock custom fields
    expect(screen.getByText('Add Field')).toBeTruthy()
    expect(screen.queryByDisplayValue('Primary Medium')).toBeNull()

    await fireEvent.press(screen.getByText('Add Field'))
    expect(screen.getByDisplayValue('New Field')).toBeTruthy()
  })
})
