import React from 'react'
import { render } from '@testing-library/react-native'
import { ConnectedPersonScreen } from '../ConnectedPersonScreen'
import { usePerson, useAthleteCards } from '@statman/sdk'

jest.mock('@statman/sdk', () => ({
  usePerson: jest.fn(),
  useAthleteCards: jest.fn(),
}))

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ personId: 'person-maya' }),
  useRouter: () => ({ push: jest.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

jest.mock('@/shared/share/sharePublicEntity', () => ({
  sharePublicEntity: jest.fn().mockResolvedValue(true),
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
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
      >
        <Text>{isLoading ? 'Loading...' : children}</Text>
      </Pressable>
    )
  },
}))

jest.mock('@/modules/cards/ConnectedStatmanCard', () => ({
  ConnectedStatmanCard: ({ card }: { card: any }) => {
    const { View, Text } = require('react-native')
    return (
      <View testID="mock-card">
        <Text>{card.title}</Text>
      </View>
    )
  },
}))

describe('ConnectedPersonScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when person is loading', async () => {
    ;(usePerson as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: undefined,
    })
    ;(useAthleteCards as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { data: [] },
    })

    const screen = await render(<ConnectedPersonScreen />)
    expect(screen.getByText('Loading profile')).toBeTruthy()
  })

  it('renders person profile with details and cards', async () => {
    ;(usePerson as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        data: {
          id: 'person-maya',
          displayName: 'Maya Angelou',
          bio: 'Legendary author and poet.',
          hometown: 'St. Louis, MO',
          aliases: ['Marguerite Annie Johnson'],
          claimedByUserId: 'user-123',
        },
      },
    })
    ;(useAthleteCards as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'card-1',
            title: 'I Know Why the Caged Bird Sings',
            status: 'PUBLISHED',
          },
        ],
      },
    })

    const screen = await render(<ConnectedPersonScreen />)
    expect(screen.getAllByText('Maya Angelou').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Legendary author and poet.')).toBeTruthy()
    expect(screen.getByText('St. Louis, MO')).toBeTruthy()
    expect(screen.getByText('Claimed')).toBeTruthy()
    expect(screen.getByText('Marguerite Annie Johnson')).toBeTruthy()
    expect(screen.getByText('Published Collectibles')).toBeTruthy()
    expect(screen.getByText('I Know Why the Caged Bird Sings')).toBeTruthy()
  })
})
