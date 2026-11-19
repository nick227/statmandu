import React from 'react'
import { render } from '@testing-library/react-native'
import { ConnectedStatmanCard } from '../ConnectedStatmanCard'

jest.mock('expo-router', () => ({
  Link: ({ children, href, asChild }: { children: React.ReactNode; href: unknown; asChild?: boolean }) => {
    const ReactModule = jest.requireActual('react')
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

jest.mock('../ConnectedCardClaimButton', () => ({
  ConnectedCardClaimButton: () => {
    const { Pressable, Text } = require('react-native')
    return (
      <Pressable accessibilityRole="link" accessibilityLabel="Sign in to claim this card">
        <Text>Sign in to claim this card</Text>
      </Pressable>
    )
  },
}))

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

function nestedLinkCount(node: any, insideLink = false): number {
  if (!node || typeof node === 'string' || Array.isArray(node)) {
    return Array.isArray(node) ? node.reduce((sum: number, child: any) => sum + nestedLinkCount(child, insideLink), 0) : 0
  }
  const isLink = node.props.accessibilityRole === 'link'
  const violation = insideLink && isLink ? 1 : 0
  const children = Array.isArray(node.children) ? node.children : []
  return violation + children.reduce((sum: number, child: any) => sum + nestedLinkCount(child, insideLink || isLink), 0)
}

describe('ConnectedStatmanCard', () => {
  it('keeps an anonymous unclaimed-card sign-in prompt outside card navigation', async () => {
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

    const screen = await render(<ConnectedStatmanCard card={card} size="featured" />)

    expect(screen.getByText('Card face')).toBeTruthy()
    expect(screen.getByText('Sign in to claim this card')).toBeTruthy()
    expect(nestedLinkCount(screen.toJSON())).toBe(0)
  })
})
