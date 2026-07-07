import { useState } from 'react'
import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useLogin } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { setStoredToken } from '@/lib/sdk'

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
    } catch {
      setError('Invalid email or password')
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
