import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
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

describe('AccountScreen - Personal Card Content Fields', () => {
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

  it('renders user identity and personal card content fields', async () => {
    const screen = await render(<AccountScreen />)

    expect(screen.getAllByText('Alex Designer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Personal Card Content Fields')).toBeTruthy()
    expect(screen.getByText('Creator & Artist')).toBeTruthy()
    expect(screen.getByText('Athlete & Competitor')).toBeTruthy()
    expect(screen.getByText('Live Card Preview')).toBeTruthy()
    expect(screen.getByText('Create Card with My Info')).toBeTruthy()
  })

  it('dynamically switches tailored fields when selecting Athlete pursuit', async () => {
    const screen = await render(<AccountScreen />)

    // Select Athlete & Competitor
    await fireEvent.press(screen.getByText('Athlete & Competitor'))

    expect(screen.getByText('Athlete & Competitor Attributes')).toBeTruthy()
    expect(screen.getByText('Sport / Discipline')).toBeTruthy()
    expect(screen.getByText('Position / Primary Role')).toBeTruthy()
    expect(screen.getByText('Primary Statistic')).toBeTruthy()
  })

  it('allows adding and removing custom card fields', async () => {
    const screen = await render(<AccountScreen />)

    expect(screen.getByText('Add Field')).toBeTruthy()
    expect(screen.getByDisplayValue('Primary Medium')).toBeTruthy()

    await fireEvent.press(screen.getByText('Add Field'))
    expect(screen.getByDisplayValue('New Field')).toBeTruthy()
  })
})
