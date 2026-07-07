import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useRegister } from '@statman/sdk'
import { setStoredToken } from '@/lib/sdk'
import { describeAuthError } from './useAuthError'

export function useRegisterForm() {
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
      setError(describeAuthError(err))
    }
  }

  return {
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
  }
}
