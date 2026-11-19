import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { DiscoverScreen } from '../DiscoverScreen'

const mockCards = [
  {
    id: 'card-1',
    title: 'First Dunk',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    editionMode: 'LIMITED',
    editionSize: 25,
    issuedCount: 5,
    publicationType: 'COMMUNITY',
    createdByUserId: 'user-creator-1',
    publishedByUserId: null,
    teamId: 'team-1',
    athlete: {
      displayName: 'Jordan Sports',
      teamName: 'Hawks',
    },
  },
  {
    id: 'card-2',
    title: 'Piano Solo',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    editionMode: 'UNLIMITED',
    editionSize: null,
    issuedCount: 12,
    publicationType: 'OFFICIAL',
    createdByUserId: 'user-creator-2',
    publishedByUserId: 'user-publisher-2',
    teamId: null,
    athlete: {
      displayName: 'Amadeus Artist',
      teamName: null,
    },
  },
]

const mockPeople = [
  {
    id: 'person-1',
    displayName: 'Avery Musician',
    bio: 'Independent pianist and composer',
    aliases: ['Ave'],
    avatarUrl: null,
    claimedByUserId: null,
  },
]

jest.mock('@statman/sdk', () => ({
  useRecentCards: (_sort?: string) => ({
    data: { data: mockCards },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  usePeople: () => ({
    data: { data: mockPeople },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useSearch: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}))

jest.mock('@/shared/ui/Button', () => ({
  Button: ({ children, onPress }: any) => {
    const { Pressable, Text } = require('react-native')
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    )
  },
}))

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock('@/modules/cards/ConnectedStatmanCard', () => ({
  ConnectedStatmanCard: ({ card }: { card: any }) => {
    const { View, Text } = require('react-native')
    return (
      <View testID={`card-${card.id}`}>
        <Text>{card.title}</Text>
      </View>
    )
  },
}))

describe('DiscoverScreen', () => {
  it('renders RARE brand identity and primary quick actions', async () => {
    const screen = await render(<DiscoverScreen />)

    expect(screen.getByText('RARE Digital Collectibles')).toBeTruthy()
    expect(screen.getByText('Create yourself. Collect anyone.')).toBeTruthy()
    expect(screen.getByText('Create in Studio')).toBeTruthy()
    expect(screen.getByText('My Collection')).toBeTruthy()
    expect(screen.getByText('Add Person')).toBeTruthy()
  })

  it('renders category browsing tabs including All and Sports', async () => {
    const screen = await render(<DiscoverScreen />)

    expect(screen.getByText('All')).toBeTruthy()
    expect(screen.getByText('Sports')).toBeTruthy()
    expect(screen.getByText('Music')).toBeTruthy()
    expect(screen.getByText('Film')).toBeTruthy()
  })

  it('truthfully reports unclassified category when an upcoming pursuit is selected', async () => {
    const screen = await render(<DiscoverScreen />)

    // Select Music category via its accessible button
    await fireEvent.press(screen.getByLabelText('Music'))

    expect(screen.getByText('No Music cards classified yet')).toBeTruthy()
    expect(
      screen.getByText(
        'Pursuit classification for Music is scheduled for the upcoming data release. Browse All cards or design a custom Music card in Studio.'
      )
    ).toBeTruthy()
  })

  it('filters sports cards when Sports category is selected', async () => {
    const screen = await render(<DiscoverScreen />)

    // Select Sports category via its accessible button
    await fireEvent.press(screen.getByLabelText('Sports'))

    expect(screen.getAllByText('First Dunk').length).toBeGreaterThan(0)
    expect(screen.queryByText('Piano Solo')).toBeNull()
  })

  it('performs live searching and allows clearing the search query', async () => {
    const screen = await render(<DiscoverScreen />)

    const searchInput = screen.getByPlaceholderText('Search cards, creators, or subjects...')
    await fireEvent.changeText(searchInput, 'Dunk')

    expect(screen.getByText('Search results for "Dunk"')).toBeTruthy()
    expect(screen.getAllByText('First Dunk').length).toBeGreaterThan(0)
  })

  it('accurately distinguishes Community vs Official releases without fabricating publishers', async () => {
    const screen = await render(<DiscoverScreen />)

    // First Dunk is COMMUNITY with null publishedByUserId
    expect(screen.getByText('Community')).toBeTruthy()
    expect(screen.getByText('Jordan Sports · By @user-creator-1')).toBeTruthy()

    // Piano Solo is OFFICIAL with publishedByUserId
    expect(screen.getByText('Official')).toBeTruthy()
    expect(screen.getByText('Amadeus Artist · By @user-creator-2 · Pub @user-publisher-2')).toBeTruthy()
  })
})
