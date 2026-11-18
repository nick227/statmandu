import { useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useCardBatchStatus, useGenerateCard, usePublishCard } from '@statman/sdk'

export function useCardReview() {
  const params = useLocalSearchParams<{ cardIds?: string }>()
  const cardIds = useMemo(() => (params.cardIds ? params.cardIds.split(',').filter(Boolean) : []), [params.cardIds])
  const batch = useCardBatchStatus(cardIds)
  const cards = batch.data ?? []
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const publishCard = usePublishCard()
  const generateCard = useGenerateCard()
  const [isPublishing, setIsPublishing] = useState(false)

  function toggle(cardId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  async function publishSelected() {
    setIsPublishing(true)
    try {
      for (const cardId of selectedIds) {
        await publishCard.mutateAsync({ cardId, body: { visibility: 'PUBLIC' } })
      }
    } finally {
      setIsPublishing(false)
    }
  }

  return {
    cardIds,
    cards,
    selectedIds,
    toggle,
    publishSelected,
    isPublishing,
    retry: (cardId: string) => generateCard.mutate(cardId),
    isRetrying: generateCard.isPending,
  }
}
