import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useLogin } from '@statman/sdk'
import { setStoredToken } from '@/lib/sdk'
import { describeAuthError } from './useAuthError'

export function useLoginForm() {
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
      setError(describeAuthError(err))
    }
  }

  return {
    email,
    error,
    login,
    onSubmit,
    password,
    setEmail,
    setPassword,
  }
}
