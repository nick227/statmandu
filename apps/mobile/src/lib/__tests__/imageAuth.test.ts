import { imageAuthHeaders, initApiClient } from '../sdk'

jest.mock('@statman/sdk', () => ({ createApiClient: () => ({ use: jest.fn() }) }))
jest.mock('expo-secure-store', () => ({ getItem: () => 'test-native-session' }))
jest.mock('../adminHeaders', () => ({ consumeNextAdminNote: () => undefined, getActAsUserId: () => undefined }))

test('native image credentials are restricted to the configured API image route', () => {
  initApiClient('https://api.example.test')
  expect(imageAuthHeaders('https://api.example.test/uploads/images/private/photo.png')).toEqual({ Authorization: 'Bearer test-native-session' })
  expect(imageAuthHeaders('https://other.example.test/uploads/images/photo.png')).toBeUndefined()
  expect(imageAuthHeaders('https://api.example.test.evil.test/uploads/images/photo.png')).toBeUndefined()
  expect(imageAuthHeaders('https://api.example.test/untrusted')).toBeUndefined()
  expect(imageAuthHeaders('invalid-url')).toBeUndefined()
})
