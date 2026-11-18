import { useQuery } from '@tanstack/react-query'
import { getApiClient } from '../client'

export function useHomeDiscovery() {
  return useQuery({
    queryKey: ['discovery', 'home'],
    queryFn: async () => {
      const client = getApiClient()
      const { data, error } = await client.GET('/discovery/home')
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useExploreDiscovery(params: { cursor?: string; limit?: number; query?: string; sort?: 'recent' | 'popular' | 'performance' | 'featured' } = {}) {
  return useQuery({
    queryKey: ['discovery', 'explore', params],
    queryFn: async () => {
      const client = getApiClient()
      const { data, error } = await client.GET('/discovery/explore', { params: { query: params } })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
