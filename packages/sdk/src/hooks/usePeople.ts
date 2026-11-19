import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function usePeople(q = '') {
  return useQuery({ queryKey: ['people', q], queryFn: async () => {
    const { data, error, response } = await getApiClient().GET('/people', { params: { query: { q } } })
    if (error) throw new ApiError(response.status, error.error)
    return data!
  } })
}
export function usePerson(id: string) {
  return useQuery({ queryKey: ['people', 'detail', id], enabled: Boolean(id), queryFn: async () => {
    const { data, error, response } = await getApiClient().GET('/people/{personId}', { params: { path: { personId: id } } })
    if (error) throw new ApiError(response.status, error.error)
    return data!
  } })
}
export function useCreatePerson() {
  const cache = useQueryClient()
  return useMutation({ mutationFn: async (body: { displayName: string; bio?: string }) => {
    const { data, error, response } = await getApiClient().POST('/people', { body })
    if (error) throw new ApiError(response.status, error.error)
    return data!
  }, onSuccess: () => cache.invalidateQueries({ queryKey: ['people'] }) })
}
