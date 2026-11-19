import { usePeople, useCreatePerson, type components } from '@statman/sdk'

export type PersonProfile = components['schemas']['PersonProfile']

export function usePersonSelector(searchQuery = '') {
  const peopleQuery = usePeople(searchQuery)
  const createPersonMutation = useCreatePerson()

  return {
    people: peopleQuery.data?.data ?? [],
    isLoading: peopleQuery.isLoading,
    createPerson: createPersonMutation.mutateAsync,
    isCreating: createPersonMutation.isPending,
  }
}
