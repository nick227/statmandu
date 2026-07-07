import { Redirect } from 'expo-router'
import { useCurrentUser } from '@statman/sdk'
import { View } from 'react-native'
import { Spinner } from '@/components/ui/Spinner'

export interface AuthGuardProps {
  children: React.ReactNode
}

// Expo Router equivalent of templates/web/AuthGuard.tsx — redirects to
// /login if unauthenticated. Wrap any screen/layout that requires a session.
export function AuthGuard({ children }: AuthGuardProps) {
  const { data, isLoading, isError } = useCurrentUser()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Spinner />
      </View>
    )
  }

  if (isError || !data) {
    return <Redirect href="/login" />
  }

  return <>{children}</>
}
