/**
 * Unified Media Library Hook
 *
 * "Upload media once. Reuse everywhere."
 *
 * Aggregates:
 * 1. Curated RARE Presets (cultural, historical, athletic, sci-fi)
 * 2. User's Personal Library (all uploads across designs and sessions)
 * 3. Subject Profile Gallery (media specifically linked to the selected Person Profile)
 *
 * Provides a unified asset interface for Card Studio and Profile editors.
 */

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError, type components } from '@statman/sdk'
import { CURATED_ARTWORKS, type ArtworkPreset } from '@/modules/designs/curatedArtwork'

export type ImageAsset = components['schemas']['ImageAsset']

export interface MediaLibraryItem {
  id: string
  url: string
  label: string
  source: 'CURATED' | 'USER_LIBRARY' | 'PROFILE_GALLERY'
  category?: string
  width?: number | null
  height?: number | null
  createdAt?: string
}

export interface UseUnifiedMediaLibraryOptions {
  personProfileId?: string | null
  creatorUserId?: string | null
}

export function useUnifiedMediaLibrary({
  personProfileId,
  creatorUserId,
}: UseUnifiedMediaLibraryOptions = {}) {
  const queryClient = useQueryClient()

  // Local state for assets uploaded in the current session / client cache
  const [localUserLibrary, setLocalUserLibrary] = useState<MediaLibraryItem[]>([])

  // Convert curated presets to MediaLibraryItems
  const curatedItems = useMemo<MediaLibraryItem[]>(() => {
    return CURATED_ARTWORKS.map((preset) => ({
      id: preset.id,
      url: preset.url,
      label: preset.label,
      source: 'CURATED',
      category: preset.category,
    }))
  }, [])

  // Query server for images attached to this person profile (if any)
  const profileImagesQuery = useQuery({
    queryKey: ['media-library', 'person', personProfileId],
    enabled: Boolean(personProfileId),
    queryFn: async () => {
      try {
        const { data, error } = await getApiClient().GET('/images', {
          params: {
            query: {
              targetType: 'ATHLETE_PROFILE',
              targetId: personProfileId!,
            },
          },
        })
        if (error) return []
        return (data?.data ?? []).map((img: ImageAsset): MediaLibraryItem => ({
          id: img.id,
          url: img.url,
          label: img.originalFilename || 'Profile Media',
          source: 'PROFILE_GALLERY',
          category: img.usage,
          width: img.width,
          height: img.height,
          createdAt: img.createdAt,
        }))
      } catch {
        return []
      }
    },
  })

  // Aggregate unified media collection
  const allMediaItems = useMemo<MediaLibraryItem[]>(() => {
    const profileItems = profileImagesQuery.data ?? []

    // De-duplicate by ID
    const seen = new Set<string>()
    const combined: MediaLibraryItem[] = []

    // 1. Session & User Library uploads (top priority)
    for (const item of localUserLibrary) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        combined.push(item)
      }
    }

    // 2. Profile Gallery
    for (const item of profileItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        combined.push(item)
      }
    }

    // 3. Curated Presets
    for (const item of curatedItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        combined.push(item)
      }
    }

    return combined
  }, [localUserLibrary, profileImagesQuery.data, curatedItems])

  // Register an uploaded or external image into the user's reusable library
  const registerUploadedMedia = useCallback((item: { id: string; url: string; label?: string; category?: string }) => {
    const newItem: MediaLibraryItem = {
      id: item.id,
      url: item.url,
      label: item.label || 'Uploaded Image',
      source: 'USER_LIBRARY',
      category: item.category || 'Custom',
      createdAt: new Date().toISOString(),
    }
    setLocalUserLibrary((prev) => [newItem, ...prev.filter((existing) => existing.id !== item.id)])
    return newItem
  }, [])

  return {
    allMedia: allMediaItems,
    userLibrary: localUserLibrary,
    curatedPresets: curatedItems,
    profileGallery: profileImagesQuery.data ?? [],
    isLoading: profileImagesQuery.isLoading,
    registerUploadedMedia,
  }
}
