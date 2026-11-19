import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useCardDesigns,
  useCardDesign,
  useCreateCardDesign,
  useUpdateCardDesign,
  useArchiveCardDesign,
  RevisionConflictError,
} from '../useCardDesigns'
import { getApiClient } from '@statman/sdk'

jest.mock('@statman/sdk', () => {
  const actual = jest.requireActual('@statman/sdk')
  return {
    ...actual,
    getApiClient: jest.fn(),
  }
})

describe('useCardDesigns', () => {
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

  it('fetches card designs successfully', async () => {
    const mockDesigns = [
      { id: 'design-1', title: 'First Design', revision: 1, composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] } },
    ]
    mockGetApiClient.mockReturnValue({
      GET: jest.fn().mockResolvedValue({
        data: { data: mockDesigns },
        response: { status: 200 },
      }),
    })

    const { result } = await renderHook(() => useCardDesigns(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDesigns)
  })

  it('creates card design successfully', async () => {
    const created = {
      id: 'design-created',
      title: 'New Design',
      revision: 1,
      composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] },
    }
    mockGetApiClient.mockReturnValue({
      POST: jest.fn().mockResolvedValue({
        data: { data: created },
        response: { status: 201 },
      }),
    })

    const { result } = await renderHook(() => useCreateCardDesign(), { wrapper })

    const res = await result.current.mutateAsync({
      title: 'New Design',
      composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] },
    })

    expect(res).toEqual(created)
  })

  it('handles 409 conflict during update without crashing', async () => {
    mockGetApiClient.mockReturnValue({
      PATCH: jest.fn().mockResolvedValue({
        error: { error: 'Expected revision 1 but server is at revision 2' },
        response: { status: 409 },
      }),
    })

    const { result } = await renderHook(() => useUpdateCardDesign(), { wrapper })

    await expect(
      result.current.mutateAsync({
        designId: 'design-1',
        expectedRevision: 1,
        title: 'Conflicting title',
      }),
    ).rejects.toThrow(RevisionConflictError)
  })

  it('updates card design successfully when revision matches', async () => {
    const updated = {
      id: 'design-1',
      title: 'Updated Design',
      revision: 2,
      composition: { schemaVersion: 1, canvas: { width: 600, height: 900 }, layers: [] },
    }
    mockGetApiClient.mockReturnValue({
      PATCH: jest.fn().mockResolvedValue({
        data: { data: updated },
        response: { status: 200 },
      }),
    })

    const { result } = await renderHook(() => useUpdateCardDesign(), { wrapper })

    const res = await result.current.mutateAsync({
      designId: 'design-1',
      expectedRevision: 1,
      title: 'Updated Design',
    })

    expect(res).toEqual(updated)
  })

  it('archives card design', async () => {
    const archived = {
      id: 'design-1',
      archivedAt: '2026-11-18T20:00:00Z',
      revision: 2,
    }
    mockGetApiClient.mockReturnValue({
      PATCH: jest.fn().mockResolvedValue({
        data: { data: archived },
        response: { status: 200 },
      }),
    })

    const { result } = await renderHook(() => useArchiveCardDesign(), { wrapper })

    const res = await result.current.mutateAsync({
      designId: 'design-1',
      expectedRevision: 1,
    })

    expect(res).toEqual(archived)
  })
})
