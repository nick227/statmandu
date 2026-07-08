import { useEffect, useRef } from 'react'
import { useCard } from '@statman/sdk'
import type { components } from '@statman/sdk'
import type { CardBuilderState } from './cardBuilderTypes'
import { cardToBuilderState, isEditableCardStatus } from './cardFromApi'

type Card = components['schemas']['Card']

/** Loads an existing card into the studio when `/cards/studio?cardId=` is set. */
export function useCardStudioBootstrap(
  cardId: string | undefined,
  onLoad: (card: Card, state: CardBuilderState) => void,
) {
  const cardQuery = useCard(cardId ?? '')
  const loadedRef = useRef<string | null>(null)

  useEffect(() => {
    const card = cardQuery.data?.data
    if (!cardId || !card || loadedRef.current === card.id) return
    if (!isEditableCardStatus(card.status)) return
    loadedRef.current = card.id
    onLoad(card, cardToBuilderState(card))
  }, [cardId, cardQuery.data, onLoad])

  return {
    isLoading: Boolean(cardId) && cardQuery.isLoading,
    isError: Boolean(cardId) && cardQuery.isError,
    isLocked: Boolean(cardId) && Boolean(cardQuery.data?.data) && !isEditableCardStatus(cardQuery.data!.data.status),
  }
}
