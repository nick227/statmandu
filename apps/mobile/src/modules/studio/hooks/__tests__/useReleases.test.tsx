import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useRelease,
  useCreateRelease,
  useGenerateRelease,
  usePublishRelease,
  useClaimRelease,
  generateStableRequestId,
} from '../useReleases'
import { getApiClient } from '@statman/sdk'

jest.mock('@statman/sdk', () => {
  const actual = jest.requireActual('@statman/sdk')
  return {
    ...actual,
    getApiClient: jest.fn(),
  }
})

describe('useReleases', () => {
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

  it('generates non-empty stable request IDs', () => {
    const id1 = generateStableRequestId('test')
    const id2 = generateStableRequestId('test')
    expect(id1).toContain('test_')
    expect(id2).toContain('test_')
  })

  it('creates release from design snapshot', async () => {
    const mockRelease = {
      id: 'release-1',
      title: 'First Edition',
      templateId: 'design-1',
      templateRevision: 1,
      editionMode: 'LIMITED',
      editionSize: 50,
      templateSnapshot: {
        schemaVersion: 1,
        composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] },
      },
    }

    mockGetApiClient.mockReturnValue({
      POST: jest.fn().mockResolvedValue({
        data: { data: mockRelease },
        response: { status: 201 },
      }),
    })

    const { result } = await renderHook(() => useCreateRelease(), { wrapper })

    const res = await result.current.mutateAsync({
      templateId: 'design-1',
      expectedRevision: 1,
      personProfileId: 'person-1',
      title: 'First Edition',
      editionMode: 'LIMITED',
      editionSize: 50,
      requestId: 'req-stable-1',
    })

    expect(res).toEqual(mockRelease)
  })

  it('publishes a release', async () => {
    const published = {
      id: 'release-1',
      status: 'PUBLISHED',
      publishedAt: '2026-11-18T20:00:00Z',
    }

    mockGetApiClient.mockReturnValue({
      POST: jest.fn().mockResolvedValue({
        data: { data: published },
        response: { status: 200 },
      }),
    })

    const { result } = await renderHook(() => usePublishRelease(), { wrapper })

    const res = await result.current.mutateAsync({
      releaseId: 'release-1',
      visibility: 'PUBLIC',
    })

    expect(res).toEqual(published)
  })

  it('claims an authentic issue from a release', async () => {
    const issue = {
      id: 'issue-1',
      issueNumber: 1,
      cardTemplateId: 'release-1',
      releaseId: 'release-1',
      status: 'CLAIMED',
    }

    mockGetApiClient.mockReturnValue({
      POST: jest.fn().mockResolvedValue({
        data: { data: issue },
        response: { status: 201 },
      }),
    })

    const { result } = await renderHook(() => useClaimRelease(), { wrapper })

    const res = await result.current.mutateAsync('release-1')

    expect(res).toEqual(issue)
  })
})
