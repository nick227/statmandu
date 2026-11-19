import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useMyStorefront,
  useUpdateMyStorefront,
  useStorefront,
  useStorefrontReleases,
} from '../useStorefront'
import { getApiClient } from '@statman/sdk'

jest.mock('@statman/sdk', () => {
  const actual = jest.requireActual('@statman/sdk')
  return {
    ...actual,
    getApiClient: jest.fn(),
  }
})

describe('useStorefront', () => {
  let queryClient: QueryClient
  const mockGetApiClient = getApiClient as jest.Mock

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('fetches creator storefront and public releases', async () => {
    const storefront = {
      id: 'store-1',
      userId: 'user-1',
      username: 'creator1',
      displayName: 'Creator One',
      avatarUrl: null,
      description: 'Official collectible studio',
      commerceEnabled: false,
    }

    const releases = [
      { id: 'rel-1', title: 'Debut Release', status: 'PUBLISHED' },
    ]

    mockGetApiClient.mockReturnValue({
      GET: jest.fn().mockImplementation((path: string) => {
        if (path === '/storefronts/{username}') {
          return Promise.resolve({ data: { data: storefront }, response: { status: 200 } })
        }
        if (path === '/storefronts/{username}/releases') {
          return Promise.resolve({ data: { data: releases, meta: { hasMore: false } }, response: { status: 200 } })
        }
        return Promise.resolve({ data: null, response: { status: 404 } })
      }),
    })

    const storeHook = await renderHook(() => useStorefront('creator1'), { wrapper })
    await waitFor(() => expect(storeHook.result.current.isSuccess).toBe(true))
    expect(storeHook.result.current.data).toEqual(storefront)

    const releasesHook = await renderHook(() => useStorefrontReleases('creator1'), { wrapper })
    await waitFor(() => expect(releasesHook.result.current.isSuccess).toBe(true))
    expect(releasesHook.result.current.data?.releases).toEqual(releases)
  })

  it('updates creator catalog description', async () => {
    const updated = {
      id: 'store-1',
      userId: 'user-1',
      username: 'creator1',
      description: 'Updated bio and artist statement',
      commerceEnabled: false,
    }

    mockGetApiClient.mockReturnValue({
      PATCH: jest.fn().mockResolvedValue({
        data: { data: updated },
        response: { status: 200 },
      }),
    })

    const { result } = await renderHook(() => useUpdateMyStorefront(), { wrapper })

    const res = await result.current.mutateAsync({
      description: 'Updated bio and artist statement',
    })

    expect(res).toEqual(updated)
  })
})
