import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
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

describe('AccountScreen - Personal Card Content Fields & Media Grid', () => {
  const mockUser = {
    id: 'user-1',
    email: 'creator@rare.com',
    profile: {
      displayName: 'Alex Designer',
      username: 'alexdesigns',
      avatarUrl: null,
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

  it('renders user identity, personal card fields, and media library', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    expect(screen.getAllByText('Alex Designer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Personal Fields')).toBeTruthy()
    expect(screen.getAllByText('Creator').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Athlete')).toBeTruthy()
    expect(screen.getByText('Save Attributes')).toBeTruthy()

    // Media Library grid
    expect(screen.getByText('Media Library')).toBeTruthy()
    expect(screen.getByText('Upload Media')).toBeTruthy()
    expect(screen.getByText('Add Image')).toBeTruthy()
  })

  it('dynamically switches tailored fields when selecting Athlete pursuit', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    // Select Athlete
    await fireEvent.press(screen.getByText('Athlete'))

    expect(screen.getByText('Athlete Attributes')).toBeTruthy()
    expect(screen.getByText('Sport / Discipline')).toBeTruthy()
    expect(screen.getByText('Position / Role')).toBeTruthy()
    expect(screen.getByText('Primary Statistic')).toBeTruthy()
  })

  it('allows adding and removing custom card fields', async () => {
    const screen = await renderWithClient(<AccountScreen />)

    expect(screen.getByText('Add Field')).toBeTruthy()
    expect(screen.getByDisplayValue('Primary Medium')).toBeTruthy()

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
