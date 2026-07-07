import { useState } from 'react'
import { View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useRegister } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { setStoredToken } from '@/lib/sdk'

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
    } catch {
      setError('Could not create account — check your details and try again')
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
