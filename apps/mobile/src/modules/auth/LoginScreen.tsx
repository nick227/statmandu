import { View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useLoginForm } from '@/modules/auth/useLoginForm'

export function LoginScreen() {
  const { email, error, login, onSubmit, password, setEmail, setPassword } = useLoginForm()

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
