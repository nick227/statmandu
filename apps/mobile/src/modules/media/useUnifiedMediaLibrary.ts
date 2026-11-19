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

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useQuery } from '@tanstack/react-query'
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

// In-memory shared cache across studio, profile, and app screens
let globalUserLibrary: MediaLibraryItem[] = []
const libraryListeners = new Set<() => void>()

function notifyLibraryListeners() {
  libraryListeners.forEach((listener) => listener())
}

export function useUnifiedMediaLibrary({
  personProfileId,
}: UseUnifiedMediaLibraryOptions = {}) {
  // Local state subscribed to the global client library
  const [localUserLibrary, setLocalUserLibrary] = useState<MediaLibraryItem[]>(() => [...globalUserLibrary])
  const [isPicking, setIsPicking] = useState(false)
  const uploadImageMutation = useUploadImage()

  useEffect(() => {
    const handleUpdate = () => setLocalUserLibrary([...globalUserLibrary])
    libraryListeners.add(handleUpdate)
    return () => {
      libraryListeners.delete(handleUpdate)
    }
  }, [])

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

  // Register an uploaded or external image into the user's reusable library
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
    globalUserLibrary = [newItem, ...globalUserLibrary.filter((existing) => existing.id !== item.id)]
    notifyLibraryListeners()
    return newItem
  }, [])

  // Remove an uploaded item from the client library
  const removeUploadedMedia = useCallback((id: string) => {
    globalUserLibrary = globalUserLibrary.filter((existing) => existing.id !== id)
    notifyLibraryListeners()
  }, [])

  // Unified picker and uploader: works seamlessly on Web and Native
  const pickAndUploadMedia = useCallback(async (options?: { targetId?: string; targetType?: string }) => {
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

      // 1. Instantly register in the local library so it's immediately visible
      const registered = registerUploadedMedia({
        id: asset.uri,
        url: asset.uri,
        label,
        category: 'Upload',
        width: asset.width,
        height: asset.height,
      })

      // 2. If targetId is provided, attempt server sync in the background
      if (options?.targetId) {
        try {
          const contentType = asset.mimeType === 'image/png' || asset.mimeType === 'image/webp' ? asset.mimeType : 'image/jpeg'
          const res = await uploadImageMutation.mutateAsync({
            targetType: options.targetType || 'ATHLETE_PROFILE',
            targetId: options.targetId,
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
          if (res?.data?.url) {
            registerUploadedMedia({
              id: res.data.id || res.data.url,
              url: res.data.url,
              label: res.data.originalFilename || label,
              category: 'Upload',
              width: res.data.width,
              height: res.data.height,
            })
          }
        } catch (serverErr) {
          // Gracefully retain local registration if server call fails
          console.warn('Server upload failed, cached locally:', serverErr)
        }
      }

      return { success: true, item: registered }
    } catch (err: any) {
      console.warn('pickAndUploadMedia error:', err)
      return { error: err?.message || 'Failed to select media' }
    } finally {
      setIsPicking(false)
    }
  }, [registerUploadedMedia, uploadImageMutation])

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

  return {
    allMedia: allMediaItems,
    userLibrary: localUserLibrary,
    curatedPresets: curatedItems,
    profileGallery: profileImagesQuery.data ?? [],
    isLoading: profileImagesQuery.isLoading,
    isUploading: isPicking || uploadImageMutation.isPending,
    registerUploadedMedia,
    removeUploadedMedia,
    pickAndUploadMedia,
  }
}
