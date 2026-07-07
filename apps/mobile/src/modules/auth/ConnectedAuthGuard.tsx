import { Redirect } from 'expo-router'
import { useCurrentUser } from '@statman/sdk'
import { LoadingState } from '@/shared/ui/LoadingState'

export interface ConnectedAuthGuardProps {
  children: React.ReactNode
}

export function ConnectedAuthGuard({ children }: ConnectedAuthGuardProps) {
  const { data, isLoading, isError } = useCurrentUser()

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !data) {
    return <Redirect href="/login" />
  }

  return <>{children}</>
}
