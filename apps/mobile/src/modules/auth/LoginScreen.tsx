import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useLoginForm } from '@/modules/auth/useLoginForm'

export function LoginScreen() {
  const { email, error, login, onSubmit, password, setEmail, setPassword } = useLoginForm()

  return (
    <View className="flex-1 bg-canvas items-center justify-center p-6 md:p-8">
      <View className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-6 md:p-8 gap-5 shadow-xs">
        <View className="gap-1 items-center">
          <Text variant="entityName" className="text-2xl font-bold text-text">Sign In</Text>
          <Text variant="caption" className="text-sm text-muted-text">Welcome back to RARE</Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
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

          <View className="gap-1.5">
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
          isLoading={login.isPending}
          onPress={onSubmit}
          className="h-11 justify-center rounded-xl font-bold"
        >
          Sign In
        </Button>

        <Link href="/register" asChild>
          <Pressable className="active:opacity-70 py-1">
            <Text className="text-center text-sm font-medium text-brand">
              Don't have an account? Sign Up
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
