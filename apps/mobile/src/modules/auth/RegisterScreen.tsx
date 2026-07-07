import { View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useRegisterForm } from '@/modules/auth/useRegisterForm'

export function RegisterScreen() {
  const {
    displayName,
    email,
    error,
    onSubmit,
    password,
    register,
    setDisplayName,
    setEmail,
    setPassword,
    setUsername,
    username,
  } = useRegisterForm()

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
