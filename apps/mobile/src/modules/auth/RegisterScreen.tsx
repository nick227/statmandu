import { Pressable, View } from 'react-native'
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
    <View className="flex-1 bg-canvas items-center justify-center p-6 md:p-8">
      <View className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-6 md:p-8 gap-5 shadow-xs">
        <View className="gap-1 items-center">
          <Text variant="entityName" className="text-2xl font-bold text-text">Create Account</Text>
          <Text variant="caption" className="text-sm text-muted-text">Join RARE to collect and publish cards</Text>
        </View>

        <View className="gap-3.5">
          <View className="gap-1">
            <Text className="text-xs font-semibold text-text">Display Name</Text>
            <Input
              placeholder="e.g. Maya Lin"
              value={displayName}
              onChangeText={setDisplayName}
              className="h-11 px-3 text-sm"
            />
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold text-text">Username</Text>
            <Input
              placeholder="e.g. mayalin"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              className="h-11 px-3 text-sm"
            />
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold text-text">Email Address</Text>
            <Input
              placeholder="name@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className="h-11 px-3 text-sm"
            />
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold text-text">Password</Text>
            <Input
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="h-11 px-3 text-sm"
            />
          </View>
        </View>

        {error ? <Text className="text-sm text-live">{error}</Text> : null}

        <Button
          isLoading={register.isPending}
          onPress={onSubmit}
          className="h-11 justify-center rounded-xl font-bold"
        >
          Create Account
        </Button>

        <Link href="/login" asChild>
          <Pressable className="active:opacity-70 py-1">
            <Text className="text-center text-sm font-medium text-brand">
              Already have an account? Sign In
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
