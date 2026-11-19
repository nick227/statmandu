/**
 * Unified Media Library Hook
 *
 * "Upload media once. Reuse everywhere."
 *
 * Aggregates:
 * 1. Curated RARE Presets (cultural, historical, athletic, sci-fi)
 * 2. User's Personal Library (server-backed assets for the authenticated profile)
 * 3. Subject Profile Gallery (media specifically linked to the selected Person Profile)
 *
 * Provides a unified asset interface for Card Studio and Profile editors.
 */

import { useState, useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, useUploadImage, type components } from '@statman/sdk'
import { CURATED_ARTWORKS } from '@/modules/designs/curatedArtwork'

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
}: UseUnifiedMediaLibraryOptions = {}) {
  const queryClient = useQueryClient()
  const [isPicking, setIsPicking] = useState(false)
  const uploadImageMutation = useUploadImage()

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
          label: img.originalFilename || 'Uploaded Image',
          source: 'USER_LIBRARY',
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

  const userLibrary = useMemo<MediaLibraryItem[]>(() => {
    return profileImagesQuery.data ?? []
  }, [profileImagesQuery.data])

  // Register an uploaded or external image into the query client cache
  const registerUploadedMedia = useCallback((item: {
    id: string
    url: string
    label?: string
    category?: string
    width?: number | null
    height?: number | null
  }) => {
    const newItem: MediaLibraryItem = {
      id: item.id,
      url: item.url,
      label: item.label || 'Uploaded Image',
      source: 'USER_LIBRARY',
      category: item.category || 'Custom',
      width: item.width,
      height: item.height,
      createdAt: new Date().toISOString(),
    }
    if (personProfileId) {
      queryClient.setQueryData<MediaLibraryItem[]>(
        ['media-library', 'person', personProfileId],
        (existing = []) => [newItem, ...existing.filter((x) => x.id !== newItem.id)]
      )
    }
    return newItem
  }, [personProfileId, queryClient])

  // Remove an item from the cache
  const removeUploadedMedia = useCallback((id: string) => {
    if (personProfileId) {
      queryClient.setQueryData<MediaLibraryItem[]>(
        ['media-library', 'person', personProfileId],
        (existing = []) => existing.filter((item) => item.id !== id)
      )
    }
  }, [personProfileId, queryClient])

  // Unified picker and server uploader: works seamlessly on Web and Native
  const pickAndUploadMedia = useCallback(async (options?: { targetId?: string; targetType?: string }) => {
    const targetId = options?.targetId || personProfileId
    if (!targetId) {
      return { error: 'A profile is required to upload media.' }
    }

    setIsPicking(true)
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          return { error: 'Photo library access is needed to select media.' }
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      })

      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        return { canceled: true }
      }

      const asset = result.assets[0]
      const label = asset.fileName || `Upload ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      const contentType = asset.mimeType === 'image/png' || asset.mimeType === 'image/webp' ? asset.mimeType : 'image/jpeg'

      const res = await uploadImageMutation.mutateAsync({
        targetType: options?.targetType || 'ATHLETE_PROFILE',
        targetId,
        usage: 'GALLERY',
        contentType,
        file: {
          uri: asset.uri,
          name: asset.fileName || `upload.${contentType.split('/')[1]}`,
          type: contentType,
        },
        originalFilename: asset.fileName ?? undefined,
        width: asset.width,
        height: asset.height,
      })

      await queryClient.invalidateQueries({
        queryKey: ['media-library', 'person', targetId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['images', options?.targetType || 'ATHLETE_PROFILE', targetId],
      })

      const item: MediaLibraryItem = {
        id: res?.data?.id || res?.data?.url || asset.uri,
        url: res?.data?.url || asset.uri,
        label: res?.data?.originalFilename || label,
        source: 'USER_LIBRARY',
        category: 'Upload',
        width: res?.data?.width || asset.width,
        height: res?.data?.height || asset.height,
        createdAt: new Date().toISOString(),
      }

      return { success: true, item }
    } catch (err: any) {
      console.warn('pickAndUploadMedia error:', err)
      return { error: err?.message || 'Failed to upload media.' }
    } finally {
      setIsPicking(false)
    }
  }, [personProfileId, uploadImageMutation, queryClient])

  // Aggregate unified media collection
  const allMediaItems = useMemo<MediaLibraryItem[]>(() => {
    const profileItems = userLibrary

    // De-duplicate by ID
    const seen = new Set<string>()
    const combined: MediaLibraryItem[] = []

    // 1. User & Profile uploads (top priority)
    for (const item of profileItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        combined.push(item)
      }
    }

    // 2. Curated Presets
    for (const item of curatedItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        combined.push(item)
      }
    }

    return combined
  }, [userLibrary, curatedItems])

  return {
    allMedia: allMediaItems,
    userLibrary,
    curatedPresets: curatedItems,
    profileGallery: userLibrary,
    isLoading: profileImagesQuery.isLoading,
    isUploading: isPicking || uploadImageMutation.isPending,
    registerUploadedMedia,
    removeUploadedMedia,
    pickAndUploadMedia,
  }
}
