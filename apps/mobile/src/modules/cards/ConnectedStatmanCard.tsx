import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { StatmanCard, type StatmanCardSize } from './StatmanCard'
import { CardClaimButtonView, ConnectedCardClaimButton } from './ConnectedCardClaimButton'
import { isEditableCardStatus } from './builder/cardFromApi'

type Card = components['schemas']['Card']
type CardDownloadContext = 'PROFILE' | 'HOME' | 'EXPLORE' | 'CARD_STUDIO' | 'SHARED_LINK'

export interface ConnectedStatmanCardProps {
  card: Card
  size?: StatmanCardSize
  /** Owner-only context (draft/generating/failed) — passed through to StatmanCard. */
  showStatus?: boolean
  /** When true, unfinished owned cards open Card Studio instead of the public detail page. */
  editInStudio?: boolean
  /** Which surface this card link lives on — carried through to the detail
   *  screen so a later download can be attributed correctly (see the
   *  athlete-facing distribution panel). Every real call site should pass
   *  one; omitted only falls back to no param (detail screen then reports
   *  DIRECT, matching a bookmarked/typed URL). */
  source?: CardDownloadContext
  /** Pass this when the caller already has auth state in scope (see
   *  CardsGrid in CardManagerScreen.tsx) so the claim footer reuses it
   *  instead of subscribing to useCurrentUser() a second time. Required
   *  for any caller rendering inside a FlatList — see the fix note below. */
  authState?: { isAuthenticated: boolean; isAuthLoading: boolean }
  className?: string
}

// Two independent, both load-bearing fixes live in this component:
//
// 1. The flippable card is never wrapped in a Link: its edge controls and
//    swipe surface are interactive. Navigation is a separate 44px action
//    below the print object, avoiding nested links/buttons on web.
// 2. When rendered inside a virtualized FlatList (Card Studio's discovery
//    grid), a second independent useCurrentUser() subscriber mounted via
//    the claim button's own internal auth check sent react-query into an
//    infinite refetch loop specific to that FlatList context (confirmed
//    live: 200+ /auth/me requests/sec, page never rendered for an
//    anonymous visitor) — even after fix #1. The `authState` prop lets a
//    caller that already subscribes to auth state (anything rendering this
//    inside a FlatList) pass it down instead of adding a second
//    subscription; callers without it (Home's ScrollView-based rail, the
//    athlete profile tab) keep the self-sufficient ConnectedCardClaimButton.
export function ConnectedStatmanCard({
  card,
  size = 'rail',
  showStatus = false,
  editInStudio = false,
  source,
  authState,
  className,
}: ConnectedStatmanCardProps) {
  const openStudio = editInStudio && showStatus && isEditableCardStatus(card.status)
  const showFooter = size === 'featured' && !showStatus

  return (
    <View className={cn('gap-xs', className)}>
      <StatmanCard card={card} size={size} showStatus={showStatus} />
      <Link
        href={
          openStudio
            ? ({ pathname: '/cards/studio', params: { cardId: card.id } } as never)
            : ({ pathname: '/cards/[cardId]', params: { cardId: card.id, ...(source ? { source } : {}) } } as never)
        }
        asChild
      >
        <Pressable
          accessibilityRole="link"
          className="min-h-11 flex-row items-center justify-center active:opacity-70"
        >
          <Text className="text-sm font-semibold text-brand">{openStudio ? 'Edit card' : 'View card details'}</Text>
        </Pressable>
      </Link>
      {showFooter ? (
        authState ? (
          <CardClaimButtonView
            card={card}
            isAuthenticated={authState.isAuthenticated}
            isAuthLoading={authState.isAuthLoading}
            compact
            className="mt-xs"
          />
        ) : (
          <ConnectedCardClaimButton card={card} compact className="mt-xs" />
        )
      ) : null}
    </View>
  )
}
