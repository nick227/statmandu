import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccountScreen } from '../AccountScreen'
import { useAccountSession } from '../useAccountSession'

jest.mock('../useAccountSession', () => ({
  useAccountSession: jest.fn(),
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

describe('AccountScreen - General Profile Fields & Media Grid', () => {
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

  it('renders general profile fields in prime field space and eliminates weird creator attributes', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    // User identity
    expect(screen.getAllByText('Alex Designer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Profile Details')).toBeTruthy()
    expect(screen.getByText('General Information')).toBeTruthy()

    // Prime fields: Name, Location, Age, Calling, Bio
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Location')).toBeTruthy()
    expect(screen.getByText('Age')).toBeTruthy()
    expect(screen.getByText('Calling / Profession')).toBeTruthy()
    expect(screen.getByText('Bio / About')).toBeTruthy()

    // Prime field values initialized from real profile data without mock text
    expect(screen.getByDisplayValue('Alex Designer')).toBeTruthy()
    expect(screen.getByDisplayValue('New York, NY')).toBeTruthy()
    expect(screen.getByDisplayValue('Digital product architect and vintage card collector.')).toBeTruthy()

    // Weird creator attributes and pursuit gimmicks MUST NOT exist
    expect(screen.queryByText('Creator Attributes')).toBeNull()
    expect(screen.queryByText('Creative Domain')).toBeNull()
    expect(screen.queryByText('Studio / Channel')).toBeNull()
    expect(screen.queryByText('Flagship Project')).toBeNull()
    expect(screen.queryByText('Signature Style')).toBeNull()
    expect(screen.queryByText('Visual Design & Collectibles')).toBeNull()
    expect(screen.queryByText('Studio RARE')).toBeNull()

    // Save Profile button
    expect(screen.getByText('Save Profile')).toBeTruthy()

    // Media Library grid
    expect(screen.getByText('Media Library')).toBeTruthy()
    expect(screen.getByText('Upload Media')).toBeTruthy()
    expect(screen.getByText('Add Image')).toBeTruthy()
  })

  it('allows editing general fields (Name, Location, Age) and saving profile', async () => {
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
    await fireEvent.press(screen.getByText('Save Profile'))
    await waitFor(() => {
      expect(screen.getByText('✓ Profile saved')).toBeTruthy()
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

  it('renders filter tabs and allows switching in media library', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    expect(screen.getByText('All')).toBeTruthy()
    expect(screen.getByText('My Uploads')).toBeTruthy()
    expect(screen.getByText('Presets')).toBeTruthy()

    await fireEvent.press(screen.getByText('Presets'))
    expect(screen.getByText('Presets')).toBeTruthy()
  })
})
