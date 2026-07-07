import { useState } from 'react'
import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useRegister, ApiError } from '@statman/sdk'
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

export default function RegisterScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const register = useRegister()

  async function onSubmit() {
    setError(null)
    try {
      const result = await register.mutateAsync({ email, username, displayName, password })
      if (result.token) await setStoredToken(result.token)
      router.replace('/(tabs)')
    } catch (err) {
      setError(describeError(err))
    }
  }

  return (
    <View className="flex-1 bg-canvas justify-center p-lg gap-md">
      <Text variant="entityName" className="text-center">Create Account</Text>
      <Input placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
      <Input placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
      <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text className="text-live">{error}</Text> : null}
      <Button isLoading={register.isPending} onPress={onSubmit}>Create Account</Button>
      <Link href="/login" className="text-center">
        <Text className="text-brand text-center">Already have an account? Sign In</Text>
      </Link>
    </View>
  )
}
