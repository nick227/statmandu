import { resolveApiUrl } from '../environment'

describe('resolveApiUrl', () => {
  it('uses localhost only for explicit development builds', () => {
    expect(resolveApiUrl({ isDevelopment: true })).toBe('http://localhost:3001')
  })

  it('accepts an explicit development URL', () => {
    expect(resolveApiUrl({ rawUrl: 'http://192.168.1.20:3001', isDevelopment: true })).toBe('http://192.168.1.20:3001')
  })

  it('accepts a valid production HTTPS URL', () => {
    expect(resolveApiUrl({ rawUrl: 'https://api.statman.example/', isDevelopment: false })).toBe('https://api.statman.example')
  })

  it('rejects a missing production URL', () => {
    expect(() => resolveApiUrl({ isDevelopment: false })).toThrow('required')
  })

  it('rejects invalid URLs', () => {
    expect(() => resolveApiUrl({ rawUrl: 'statman-api', isDevelopment: true })).toThrow('absolute')
  })

  it('rejects localhost and insecure HTTP in production', () => {
    expect(() => resolveApiUrl({ rawUrl: 'http://localhost:3001', isDevelopment: false })).toThrow('localhost')
    expect(() => resolveApiUrl({ rawUrl: 'http://api.statman.example', isDevelopment: false })).toThrow('HTTPS')
  })
})
