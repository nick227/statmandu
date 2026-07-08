import { useEffect, useState } from 'react'
import { useSearch } from '@statman/sdk'

const DEBOUNCE_MS = 300

export function useUnifiedSearch() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(q), DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [q])

  const searchQuery = useSearch({ q: debouncedQ })

  return {
    q,
    setQ,
    isSearching: debouncedQ.length > 0,
    results: searchQuery.data?.pages.flatMap((page) => page.data) ?? [],
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    hasNextPage: searchQuery.hasNextPage,
    isFetchingNextPage: searchQuery.isFetchingNextPage,
    fetchNextPage: searchQuery.fetchNextPage,
  }
}
