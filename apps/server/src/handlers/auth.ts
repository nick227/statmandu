import { AuthService } from '../services/AuthService'

const authService = new AuthService()

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // Production: web/mobile client and API are on different domains — cross-site
  // requires SameSite=None with Secure=true or the browser blocks the cookie.
  // Dev: same-site regardless of port, so Lax works.
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60,  // 30 days in seconds
}

export async function register(request: any, reply: any) {
  const { user, token } = await authService.register(request.body)
  reply.setCookie('token', token, COOKIE)
  // Cookie is for web; native clients have no cookie jar, so the raw token
  // also goes in the body for them to store (e.g. SecureStore) and replay
  // as a Bearer header — see packages/sdk/src/client.ts's getToken override.
  return reply.status(201).send({ data: user, token })
}

export async function login(request: any, reply: any) {
  const { user, token } = await authService.login(request.body)
  reply.setCookie('token', token, COOKIE)
  return reply.send({ data: user, token })
}

export async function logout(request: any, reply: any) {
  const token = request.cookies?.token ?? request.headers.authorization?.replace('Bearer ', '')
  if (token) await authService.logout(token)
  reply.clearCookie('token', { path: '/' })
  return reply.send({ data: null })
}

export async function getCurrentUser(request: any, reply: any) {
  return reply.send({ data: request.user })
}
