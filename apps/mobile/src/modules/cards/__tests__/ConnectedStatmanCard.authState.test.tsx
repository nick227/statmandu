import React from 'react'
import { render } from '@testing-library/react-native'
import { ConnectedStatmanCard } from '../ConnectedStatmanCard'

jest.mock('expo-router', () => ({
  Link: ({ children, href, asChild }: { children: React.ReactNode; href: unknown; asChild?: boolean }) => {
    const ReactModule = require('react')
    const { View } = require('react-native')
    const props = { accessibilityRole: 'link', accessibilityLabel: typeof href === 'string' ? href : 'card-detail-link' }
    return asChild && ReactModule.isValidElement(children)
      ? ReactModule.cloneElement(children, props)
      : <View {...props}>{children}</View>
  },
}))

jest.mock('../StatmanCard', () => ({
  StatmanCard: () => {
    const { Pressable, Text } = require('react-native')
    return <Pressable accessibilityRole="button"><Text>Card face</Text></Pressable>
  },
}))

// react-native-reanimated (used by the real Button for its press-scale
// animation) has no test-environment shim configured in this project yet —
// stub Button directly rather than pulling that unrelated setup gap into
// what this file is actually regression-testing (the auth-subscription fix).
jest.mock('@/shared/ui/Button', () => ({
  Button: ({ children, onPress, isLoading }: { children: React.ReactNode; onPress?: () => void; isLoading?: boolean }) => {
    const { Pressable, Text } = require('react-native')
    return (
      <Pressable accessibilityRole="button" onPress={onPress} disabled={isLoading}>
        <Text>{children}</Text>
      </Pressable>
    )
  },
}))

// The real ConnectedCardClaimButton/CardClaimButtonView are used in this
// file (not mocked) — that's the point. Only useAuthGate and useClaimCard
// are stubbed, and useAuthGate is stubbed to throw: a caller supplying
// `authState` is asserting "I already have a useCurrentUser() subscription,
// don't add a second one." A second useCurrentUser() subscriber mounted
// inside CardManagerScreen's FlatList is exactly what sent react-query into
// an infinite refetch loop for an anonymous visitor (200+ /auth/me
// requests/sec, page never rendering) — this test fails loudly if that
// regresses, instead of silently reintroducing the loop.
jest.mock('@/modules/auth/useAuthGate', () => ({
  useAuthGate: () => {
    throw new Error(
      'useAuthGate must not be called when ConnectedStatmanCard receives an authState prop — see CardManagerScreen.tsx/CardsGrid for why.'
    )
  },
}))

jest.mock('@statman/sdk', () => ({
  useClaimCard: () => ({ isPending: false, mutate: jest.fn() }),
}))

function nestedLinkCount(node: any, insideLink = false): number {
  if (!node || typeof node === 'string' || Array.isArray(node)) {
    return Array.isArray(node) ? node.reduce((sum: number, child: any) => sum + nestedLinkCount(child, insideLink), 0) : 0
  }
  const isLink = node.props.accessibilityRole === 'link'
  const violation = insideLink && isLink ? 1 : 0
  const children = Array.isArray(node.children) ? node.children : []
  return violation + children.reduce((sum: number, child: any) => sum + nestedLinkCount(child, insideLink || isLink), 0)
}

describe('ConnectedStatmanCard with an authState prop (the FlatList-safe path)', () => {
  const card = {
    id: 'card-1',
    title: 'Season opener',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    editionMode: 'UNLIMITED',
    editionSize: null,
    issuedCount: 0,
    currentUserHasClaimed: false,
  } as never

  it('renders an anonymous unclaimed card via the shared auth state, without a second useCurrentUser() subscription', async () => {
    const screen = await render(
      <ConnectedStatmanCard card={card} size="featured" authState={{ isAuthenticated: false, isAuthLoading: false }} />
    )

    expect(screen.getByText('Card face')).toBeTruthy()
    expect(screen.getByText('Sign in to claim this card')).toBeTruthy()
    expect(nestedLinkCount(screen.toJSON())).toBe(0)
  })

  it('renders a real claim button for an authenticated, unclaimed public card', async () => {
    const screen = await render(
      <ConnectedStatmanCard card={card} size="featured" authState={{ isAuthenticated: true, isAuthLoading: false }} />
    )

    expect(screen.getByText('Card face')).toBeTruthy()
    expect(screen.getByText('Claim this card')).toBeTruthy()
    expect(nestedLinkCount(screen.toJSON())).toBe(0)
  })
})
