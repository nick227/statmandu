import { useState } from 'react'
import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useLogin, ApiError } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { setStoredToken } from '@/lib/sdk'

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message || `Server error (${err.status})`
  if (err instanceof TypeError && err.message === 'Network request failed') {
    return 'Cannot reach the server — check EXPO_PUBLIC_API_URL and that the API is running'
  }
  if (err instanceof Error) return err.message
  return 'Unknown error'
}

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const login = useLogin()

  async function onSubmit() {
    setError(null)
    try {
      const result = await login.mutateAsync({ email, password })
      if (result.token) await setStoredToken(result.token)
      router.replace('/(tabs)')
    } catch (err) {
      setError(describeError(err))
    }
  }

  return (
    <View className="flex-1 bg-canvas justify-center p-lg gap-md">
      <Text variant="entityName" className="text-center">Sign In</Text>
      <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text className="text-live">{error}</Text> : null}
      <Button isLoading={login.isPending} onPress={onSubmit}>Sign In</Button>
      <Link href="/register" className="text-center">
        <Text className="text-brand text-center">Don't have an account? Sign Up</Text>
      </Link>
    </View>
  )
}
