import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useStudioUser } from './useStudioUser'
import {
  useCardDesigns,
  useCreateCardDesign,
  useUpdateCardDesign,
  RevisionConflictError,
  type CardDesign,
  type CardComposition,
} from './useCardDesigns'
import {
  useCreateRelease,
  useGenerateRelease,
  usePublishRelease,
  generateStableRequestId,
  type CardEditionMode,
} from './useReleases'
import { usePersonSelector } from './usePersonSelector'
import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  getFlagshipDesignById,
  INITIAL_CONTENT_STORE,
  type ContentStore,
  type FlagshipDesign,
  type StudioAppearanceState,
} from '@/modules/designs/flagshipDesigns'
import type {
  StudioPanelLocation,
  StudioBreadcrumb,
} from '../types/panelNavigation'
import {
  CARD_TYPES,
  getCardTypeById,
  type CardType,
} from '@/modules/designs/cardTypes'
import {
  UniversalProfile,
  BENCHMARK_PROFILES,
  toUniversalProfile,
} from '@/modules/profiles/profileTaxonomy'
import {
  buildBoundCardFields,
  getFieldSemanticKey,
  type BoundCardField,
} from '@/modules/profiles/profileAttributeResolver'
import {
  useUnifiedMediaLibrary,
  type MediaLibraryItem,
} from '@/modules/media/useUnifiedMediaLibrary'
import { areFontsReady, waitForFontsLoaded } from '@/modules/typography/textFit'

export const INITIAL_FLAGSHIP_ID = 'classic-collector'
export const INITIAL_CARD_TYPE_ID = 'standard'
export const INITIAL_IMAGE_ID = 'art-angelou'
export const INITIAL_PROFILE: UniversalProfile | null = null

const initialFlagship = getFlagshipDesignById(INITIAL_FLAGSHIP_ID) || FLAGSHIP_DESIGNS[0]
const initialCardType = getCardTypeById(INITIAL_CARD_TYPE_ID)
const initialBoundFields = buildBoundCardFields(
  initialCardType,
  INITIAL_PROFILE,
  initialFlagship.inputs.map((i) => i.id),
  {},
  new Set(),
)

export const INITIAL_RESOLVED_CONTENT_STORE: ContentStore = (() => {
  const store: ContentStore = { ...INITIAL_CONTENT_STORE }
  for (const bf of initialBoundFields) {
    store[bf.slotId] = bf.effectiveValue
  }
  return store
})()

export const INITIAL_COMPILATION = compileFlagshipDesign(
  INITIAL_FLAGSHIP_ID,
  INITIAL_RESOLVED_CONTENT_STORE,
  INITIAL_PROFILE,
  undefined,
  INITIAL_CARD_TYPE_ID,
  INITIAL_IMAGE_ID,
)

export type MediaCategoryFilter = 'ALL' | 'USER' | 'PROFILE' | 'CURATED'

/**
 * Controller hook that encapsulates all business logic, server mutations,
 * flagship compilation, and local editing history for the Card Studio.
 */
export function useCardStudioState() {
  const router = useRouter()
  const params = useLocalSearchParams<{ flagshipId?: string; imageId?: string }>()

  // ---------------------------------------------------------------------------
  // Font Readiness
  // ---------------------------------------------------------------------------
  const [fontsLoaded, setFontsLoaded] = useState(() => areFontsReady())

  // ---------------------------------------------------------------------------
  // User & Server Queries / Mutations
  // ---------------------------------------------------------------------------
  const { username: currentUsername } = useStudioUser()

  const { data: savedDesigns = [] } = useCardDesigns()
  const createDesignMutation = useCreateCardDesign()
  const updateDesignMutation = useUpdateCardDesign()

  const createReleaseMutation = useCreateRelease()
  const generateReleaseMutation = useGenerateRelease()
  const publishReleaseMutation = usePublishRelease()
  const { people, createPerson } = usePersonSelector()

  // ---------------------------------------------------------------------------
  // Subject Profile & Identity State
  // ---------------------------------------------------------------------------
  const [activeProfile, setActiveProfile] = useState<UniversalProfile | null>(INITIAL_PROFILE)
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false)

  // ---------------------------------------------------------------------------
  // Active Design Document State
  // ---------------------------------------------------------------------------
  const [activeDesign, setActiveDesign] = useState<CardDesign | null>(null)
  const [designTitle, setDesignTitle] = useState('Untitled Collectible')

  // ---------------------------------------------------------------------------
  // Taxonomy, Flagship & Artwork Selection State
  // ---------------------------------------------------------------------------
  const [activeCardTypeId, setActiveCardTypeId] = useState<string>(INITIAL_CARD_TYPE_ID)
  const [activeFlagshipId, setActiveFlagshipId] = useState<string>(
    params.flagshipId || INITIAL_FLAGSHIP_ID,
  )
  const [selectedImageId, setSelectedImageId] = useState<string>(
    params.imageId || INITIAL_IMAGE_ID,
  )

  useEffect(() => {
    if (params.imageId) {
      setSelectedImageId(params.imageId)
    }
  }, [params.imageId])

  // Linked content overrides & unlinked slots
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({})
  const [unlinkedSlotIds, setUnlinkedSlotIds] = useState<Set<string>>(new Set())

  // ---------------------------------------------------------------------------
  // 3-Level Contextual Left Panel Navigation
  // ---------------------------------------------------------------------------
  const [panelLocation, setPanelLocation] = useState<StudioPanelLocation>({
    level: 1,
    category: 'card',
  })

  const navigateTo = useCallback((loc: StudioPanelLocation) => {
    setPanelLocation(loc)
  }, [])

  const navigateBack = useCallback(() => {
    setPanelLocation((prev) => {
      if (prev.level === 3) {
        if (prev.category === 'appearance') {
          return { level: 2, category: 'appearance' }
        }
        return { level: 1, category: prev.category }
      }
      if (prev.level === 2) {
        return { level: 1, category: prev.category }
      }
      return prev
    })
  }, [])

  const breadcrumbs = useMemo<StudioBreadcrumb[]>(() => {
    const crumbs: StudioBreadcrumb[] = [
      { label: 'Studio', location: { level: 1, category: 'card' } },
    ]
    if (panelLocation.level >= 2 && panelLocation.category === 'appearance') {
      crumbs.push({
        label: 'Appearance',
        location: { level: 2, category: 'appearance' },
      })
    } else if (panelLocation.level >= 2 && panelLocation.category) {
      const catLabel =
        panelLocation.category.charAt(0).toUpperCase() + panelLocation.category.slice(1)
      crumbs.push({
        label: catLabel,
        location: { level: 1, category: panelLocation.category },
      })
    }

    if (panelLocation.level === 3 && panelLocation.category === 'appearance' && panelLocation.group) {
      const grpLabel =
        panelLocation.group.charAt(0).toUpperCase() + panelLocation.group.slice(1)
      crumbs.push({
        label: grpLabel,
        location: panelLocation,
      })
    } else if (panelLocation.level === 3 && panelLocation.category === 'artwork') {
      crumbs.push({
        label: 'Adjust',
        location: panelLocation,
      })
    }
    return crumbs
  }, [panelLocation])

  // ---------------------------------------------------------------------------
  // Creative Levers (Appearance Customization)
  // ---------------------------------------------------------------------------
  const [appearance, setAppearance] = useState<StudioAppearanceState>({})

  // Dropdown open states
  const [savedDesignsDropdownOpen, setSavedDesignsDropdownOpen] = useState(false)
  const [cardTypeDropdownOpen, setCardTypeDropdownOpen] = useState(false)
  const [designDropdownOpen, setDesignDropdownOpen] = useState(false)

  // Mutual exclusion toggles for floating dropdowns
  const togglePersonDropdown = useCallback(() => {
    setPersonDropdownOpen((prev) => {
      const next = !prev
      if (next) {
        setCardTypeDropdownOpen(false)
        setDesignDropdownOpen(false)
      }
      return next
    })
  }, [])

  const toggleCardTypeDropdown = useCallback(() => {
    setCardTypeDropdownOpen((prev) => {
      const next = !prev
      if (next) {
        setPersonDropdownOpen(false)
        setDesignDropdownOpen(false)
      }
      return next
    })
  }, [])

  const toggleDesignDropdown = useCallback(() => {
    setDesignDropdownOpen((prev) => {
      const next = !prev
      if (next) {
        setPersonDropdownOpen(false)
        setCardTypeDropdownOpen(false)
      }
      return next
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Unified Media Library
  // ---------------------------------------------------------------------------
  const mediaLibrary = useUnifiedMediaLibrary({ personProfileId: activeProfile?.id })
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<MediaCategoryFilter>('ALL')

  // Available image assets list for composition renderer & compiler
  const assetsList = useMemo(() => {
    return mediaLibrary.allMedia.map((m) => ({ id: m.id, url: m.url }))
  }, [mediaLibrary.allMedia])

  // ---------------------------------------------------------------------------
  // Composition & Local Undo/Redo History
  // ---------------------------------------------------------------------------
  const [composition, setComposition] = useState<CardComposition>(INITIAL_COMPILATION.composition)
  const [history, setHistory] = useState<CardComposition[]>([INITIAL_COMPILATION.composition])
  const [historyIndex, setHistoryIndex] = useState(0)

  // ---------------------------------------------------------------------------
  // Inline Publishing Drawer State
  // ---------------------------------------------------------------------------
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false)
  const [publishSubjectName, setPublishSubjectName] = useState(activeProfile?.displayName || '')
  const [publishSubjectBio, setPublishSubjectBio] = useState(activeProfile?.bio || '')
  const [publishEditionMode, setPublishEditionMode] = useState<CardEditionMode>('LIMITED')
  const [publishEditionSize, setPublishEditionSize] = useState('25')

  // ---------------------------------------------------------------------------
  // Status, Alerts & Feedback
  // ---------------------------------------------------------------------------
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  // ---------------------------------------------------------------------------
  // Derived Entities & Dynamic Mappings
  // ---------------------------------------------------------------------------
  const activeCardType: CardType = getCardTypeById(activeCardTypeId)
  const activeFlagship: FlagshipDesign = getFlagshipDesignById(activeFlagshipId) || FLAGSHIP_DESIGNS[0]

  // Compute bound fields from universal profile & overrides
  const boundFields = useMemo<BoundCardField[]>(() => {
    return buildBoundCardFields(
      activeCardType,
      activeProfile,
      activeFlagship.inputs.map((i) => i.id),
      fieldOverrides,
      unlinkedSlotIds,
    )
  }, [activeCardType, activeProfile, activeFlagship, fieldOverrides, unlinkedSlotIds])

  // Derive the full content store for flagship compilation
  const currentContentStore = useMemo<ContentStore>(() => {
    const store: ContentStore = { ...INITIAL_CONTENT_STORE }
    for (const bf of boundFields) {
      store[bf.slotId] = bf.effectiveValue
    }
    return store
  }, [boundFields])

  // Active flagship compilation result (composition + overflow diagnostics)
  const currentFlagshipResult = compileFlagshipDesign(
    activeFlagshipId,
    currentContentStore,
    activeProfile,
    assetsList,
    activeCardTypeId,
    selectedImageId,
    appearance,
  )

  // Re-fit typography when fonts finish loading
  useEffect(() => {
    if (fontsLoaded) return
    let active = true
    waitForFontsLoaded().then((ready) => {
      if (active && ready) {
        setFontsLoaded(true)
        const result = compileFlagshipDesign(
          activeFlagshipId,
          currentContentStore,
          activeProfile,
          assetsList,
          activeCardTypeId,
          selectedImageId,
          appearance,
        )
        setComposition(result.composition)
      }
    })
    return () => {
      active = false
    }
  }, [
    fontsLoaded,
    activeFlagshipId,
    currentContentStore,
    activeProfile,
    assetsList,
    activeCardTypeId,
    selectedImageId,
    appearance,
  ])

  // ---------------------------------------------------------------------------
  // History Helpers
  // ---------------------------------------------------------------------------
  const updateCompositionWithHistory = useCallback(
    (nextComp: CardComposition) => {
      setComposition(nextComp)
      setHistory((prev) => {
        const slice = prev.slice(0, historyIndex + 1)
        return [...slice, nextComp]
      })
      setHistoryIndex((prev) => prev + 1)
      setSaveSuccessMsg(false)
      setPublishSuccessMsg(null)
    },
    [historyIndex],
  )

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      const prevComp = history[nextIndex]
      setComposition(prevComp)

      if (prevComp.metadata?.flagship) {
        const meta = prevComp.metadata.flagship
        if (meta.id) setActiveFlagshipId(meta.id)
        if (meta.cardTypeId) setActiveCardTypeId(meta.cardTypeId)
        if (meta.selectedImageId) setSelectedImageId(meta.selectedImageId)
        const loadedStore = meta.contentStore || meta.inputs
        if (loadedStore) {
          setFieldOverrides((prev) => ({ ...prev, ...loadedStore }))
        }
        if ((meta as any).appearance) {
          setAppearance((meta as any).appearance)
        } else {
          setAppearance({})
        }
      }
    }
  }, [historyIndex, history])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      const nextComp = history[nextIndex]
      setComposition(nextComp)

      if (nextComp.metadata?.flagship) {
        const meta = nextComp.metadata.flagship
        if (meta.id) setActiveFlagshipId(meta.id)
        if (meta.cardTypeId) setActiveCardTypeId(meta.cardTypeId)
        if (meta.selectedImageId) setSelectedImageId(meta.selectedImageId)
        const loadedStore = meta.contentStore || meta.inputs
        if (loadedStore) {
          setFieldOverrides((prev) => ({ ...prev, ...loadedStore }))
        }
        if ((meta as any).appearance) {
          setAppearance((meta as any).appearance)
        } else {
          setAppearance({})
        }
      }
    }
  }, [historyIndex, history])

  // ---------------------------------------------------------------------------
  // Profile Selection & Attribute Linking
  // ---------------------------------------------------------------------------
  const handleSelectPersonProfile = useCallback(
    (person: any) => {
      const universal = person ? toUniversalProfile(person) : null
      setActiveProfile(universal)
      setPersonDropdownOpen(false)
      setPublishSubjectName(universal?.displayName || '')
      setPublishSubjectBio(universal?.bio || '')

      // Switching subjects must not transfer another subject's linked values or custom overrides
      setFieldOverrides({})
      setUnlinkedSlotIds(new Set())

      const newBound = buildBoundCardFields(
        activeCardType,
        universal,
        activeFlagship.inputs.map((i) => i.id),
        {},
        new Set(),
      )
      const newStore: ContentStore = { ...INITIAL_CONTENT_STORE }
      for (const bf of newBound) {
        newStore[bf.slotId] = bf.effectiveValue
      }

      const result = compileFlagshipDesign(
        activeFlagshipId,
        newStore,
        universal,
        assetsList,
        activeCardTypeId,
        selectedImageId,
        appearance,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      activeCardType,
      activeFlagship.inputs,
      activeFlagshipId,
      assetsList,
      activeCardTypeId,
      selectedImageId,
      appearance,
      updateCompositionWithHistory,
    ],
  )

  // ---------------------------------------------------------------------------
  // Saved Designs Management
  // ---------------------------------------------------------------------------
  const handleSelectSavedDesign = useCallback(
    (design: CardDesign) => {
      setActiveDesign(design)
      setDesignTitle(design.title)
      setSavedDesignsDropdownOpen(false)

      const meta = (design.composition as any)?.metadata?.flagship
      const loadedFlagshipId = meta?.id || INITIAL_FLAGSHIP_ID
      const loadedCardTypeId = meta?.cardTypeId || INITIAL_CARD_TYPE_ID
      const loadedImageId = meta?.selectedImageId || INITIAL_IMAGE_ID
      const loadedContent = meta?.contentStore || meta?.inputs || INITIAL_CONTENT_STORE
      const rawProfile = meta?.profile || null
      const loadedProfile = rawProfile ? toUniversalProfile(rawProfile) : null
      const loadedAppearance = meta?.appearance || {}

      setActiveFlagshipId(loadedFlagshipId)
      setActiveCardTypeId(loadedCardTypeId)
      setSelectedImageId(loadedImageId)
      setFieldOverrides(loadedContent)
      setUnlinkedSlotIds(new Set())
      setActiveProfile(loadedProfile)
      setAppearance(loadedAppearance)
      setPublishSubjectName(loadedProfile?.displayName || '')
      setPublishSubjectBio(loadedProfile?.bio || '')

      const result = compileFlagshipDesign(
        loadedFlagshipId,
        loadedContent,
        loadedProfile,
        assetsList,
        loadedCardTypeId,
        loadedImageId,
        loadedAppearance,
      )
      setComposition(result.composition)
      setHistory([result.composition])
      setHistoryIndex(0)
      setSaveSuccessMsg(false)
    },
    [assetsList],
  )

  const handleStartNewDesign = useCallback(() => {
    setActiveDesign(null)
    setDesignTitle('Untitled Collectible')
    setSavedDesignsDropdownOpen(false)
    setActiveFlagshipId(INITIAL_FLAGSHIP_ID)
    setActiveCardTypeId(INITIAL_CARD_TYPE_ID)
    setSelectedImageId(INITIAL_IMAGE_ID)
    setFieldOverrides({})
    setUnlinkedSlotIds(new Set())
    setActiveProfile(null)
    setAppearance({})
    setPublishSubjectName('')
    setPublishSubjectBio('')

    const result = compileFlagshipDesign(
      INITIAL_FLAGSHIP_ID,
      INITIAL_CONTENT_STORE,
      null,
      assetsList,
      INITIAL_CARD_TYPE_ID,
      INITIAL_IMAGE_ID,
      {},
    )
    setComposition(result.composition)
    setHistory([result.composition])
    setHistoryIndex(0)
    setSaveSuccessMsg(false)
  }, [assetsList])

  // ---------------------------------------------------------------------------
  // Card Type & Flagship Selection
  // ---------------------------------------------------------------------------
  const handleSelectCardType = useCallback(
    (typeId: string) => {
      setActiveCardTypeId(typeId)
      setCardTypeDropdownOpen(false)

      const nextCardType = getCardTypeById(typeId)
      const newBound = buildBoundCardFields(
        nextCardType,
        activeProfile,
        activeFlagship.inputs.map((i) => i.id),
        fieldOverrides,
        unlinkedSlotIds,
      )
      const newStore: ContentStore = { ...INITIAL_CONTENT_STORE }
      for (const bf of newBound) {
        newStore[bf.slotId] = bf.effectiveValue
      }

      const result = compileFlagshipDesign(
        activeFlagshipId,
        newStore,
        activeProfile,
        assetsList,
        typeId,
        selectedImageId,
        appearance,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      activeProfile,
      activeFlagship.inputs,
      fieldOverrides,
      unlinkedSlotIds,
      activeFlagshipId,
      assetsList,
      selectedImageId,
      appearance,
      updateCompositionWithHistory,
    ],
  )

  const handleSelectFlagshipDesign = useCallback(
    (designId: string) => {
      setActiveFlagshipId(designId)
      setDesignDropdownOpen(false)

      const result = compileFlagshipDesign(
        designId,
        currentContentStore,
        activeProfile,
        assetsList,
        activeCardTypeId,
        selectedImageId,
        appearance,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      currentContentStore,
      activeProfile,
      assetsList,
      activeCardTypeId,
      selectedImageId,
      appearance,
      updateCompositionWithHistory,
    ],
  )

  // ---------------------------------------------------------------------------
  // Field Editing & Re-linking
  // ---------------------------------------------------------------------------
  const handleUpdatePositionalInput = useCallback(
    (slotId: string, value: string) => {
      const fieldIndex = parseInt(slotId.replace('input', ''), 10) - 1
      const field = activeCardType.fields[fieldIndex]
      const semanticKey = getFieldSemanticKey(activeCardTypeId, field?.id || slotId, slotId)

      const nextOverrides = { ...fieldOverrides, [semanticKey]: value }
      if (slotId === 'input1') {
        nextOverrides.input1 = value
      }
      setFieldOverrides(nextOverrides)

      const nextBound = buildBoundCardFields(
        activeCardType,
        activeProfile,
        activeFlagship.inputs.map((i) => i.id),
        nextOverrides,
        unlinkedSlotIds,
      )
      const nextStore: ContentStore = { ...INITIAL_CONTENT_STORE }
      for (const bf of nextBound) {
        nextStore[bf.slotId] = bf.effectiveValue
      }

      const result = compileFlagshipDesign(
        activeFlagshipId,
        nextStore,
        activeProfile,
        assetsList,
        activeCardTypeId,
        selectedImageId,
        appearance,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      activeCardType,
      activeCardTypeId,
      fieldOverrides,
      unlinkedSlotIds,
      activeProfile,
      activeFlagship.inputs,
      assetsList,
      activeFlagshipId,
      selectedImageId,
      appearance,
      updateCompositionWithHistory,
    ],
  )

  const handleRelinkField = useCallback(
    (slotId: string) => {
      const fieldIndex = parseInt(slotId.replace('input', ''), 10) - 1
      const field = activeCardType.fields[fieldIndex]
      const semanticKey = getFieldSemanticKey(activeCardTypeId, field?.id || slotId, slotId)

      const clearedOverrides = { ...fieldOverrides }
      delete clearedOverrides[semanticKey]
      delete clearedOverrides[slotId]

      const nextUnlinked = new Set(unlinkedSlotIds)
      nextUnlinked.delete(semanticKey)
      nextUnlinked.delete(slotId)

      setFieldOverrides(clearedOverrides)
      setUnlinkedSlotIds(nextUnlinked)

      const nextBound = buildBoundCardFields(
        activeCardType,
        activeProfile,
        activeFlagship.inputs.map((i) => i.id),
        clearedOverrides,
        nextUnlinked,
      )
      const nextStore: ContentStore = { ...INITIAL_CONTENT_STORE }
      for (const bf of nextBound) {
        nextStore[bf.slotId] = bf.effectiveValue
      }

      const result = compileFlagshipDesign(
        activeFlagshipId,
        nextStore,
        activeProfile,
        assetsList,
        activeCardTypeId,
        selectedImageId,
        appearance,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      activeCardType,
      activeCardTypeId,
      fieldOverrides,
      unlinkedSlotIds,
      activeProfile,
      activeFlagship.inputs,
      activeFlagshipId,
      assetsList,
      selectedImageId,
      appearance,
      updateCompositionWithHistory,
    ],
  )

  // ---------------------------------------------------------------------------
  // Artwork Selection & Custom Upload
  // ---------------------------------------------------------------------------
  const handleSelectArtwork = useCallback(
    (artworkId: string) => {
      setSelectedImageId(artworkId)
      const result = compileFlagshipDesign(
        activeFlagshipId,
        currentContentStore,
        activeProfile,
        assetsList,
        activeCardTypeId,
        artworkId,
        appearance,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      activeFlagshipId,
      currentContentStore,
      activeProfile,
      assetsList,
      activeCardTypeId,
      appearance,
      updateCompositionWithHistory,
    ],
  )

  // ---------------------------------------------------------------------------
  // Creative Levers (Appearance Customization) & Subject Unlink
  // ---------------------------------------------------------------------------
  const handleUpdateAppearance = useCallback(
    (updates: Partial<StudioAppearanceState>) => {
      const next = { ...appearance, ...updates }
      setAppearance(next)
      const result = compileFlagshipDesign(
        activeFlagshipId,
        currentContentStore,
        activeProfile,
        assetsList,
        activeCardTypeId,
        selectedImageId,
        next,
      )
      updateCompositionWithHistory(result.composition)
    },
    [
      appearance,
      activeFlagshipId,
      currentContentStore,
      activeProfile,
      assetsList,
      activeCardTypeId,
      selectedImageId,
      updateCompositionWithHistory,
    ],
  )

  const handleUnlinkSubject = useCallback(() => {
    setActiveProfile(null)
    setPublishSubjectName('')
    setPublishSubjectBio('')
    setFieldOverrides({})
    setUnlinkedSlotIds(new Set())

    const result = compileFlagshipDesign(
      activeFlagshipId,
      INITIAL_CONTENT_STORE,
      null,
      assetsList,
      activeCardTypeId,
      selectedImageId,
      appearance,
    )
    updateCompositionWithHistory(result.composition)
  }, [
    activeFlagshipId,
    assetsList,
    activeCardTypeId,
    selectedImageId,
    appearance,
    updateCompositionWithHistory,
  ])

  const handlePickCustomImage = useCallback(async () => {
    try {
      const result = await mediaLibrary.pickAndUploadMedia({
        targetId: activeProfile?.id ?? undefined,
      })
      if (result.success && result.item) {
        handleSelectArtwork(result.item.id)
      }
    } catch (err) {
      console.warn('Failed to pick image:', err)
    }
  }, [mediaLibrary, activeProfile?.id, handleSelectArtwork])

  // Filtered media items based on active category tab
  const displayedMediaItems = useMemo<MediaLibraryItem[]>(() => {
    if (mediaCategoryFilter === 'USER') {
      return mediaLibrary.userLibrary
    }
    if (mediaCategoryFilter === 'PROFILE') {
      return mediaLibrary.profileGallery
    }
    if (mediaCategoryFilter === 'CURATED') {
      return mediaLibrary.curatedPresets
    }
    return mediaLibrary.allMedia
  }, [mediaCategoryFilter, mediaLibrary])

  // ---------------------------------------------------------------------------
  // Save Design Document
  // ---------------------------------------------------------------------------
  const handleSaveDesign = useCallback(async () => {
    setConflictMessage(null)
    setPublishSuccessMsg(null)
    try {
      if (!activeDesign) {
        const created = await createDesignMutation.mutateAsync({
          title: designTitle.trim() || 'Untitled Collectible',
          composition,
        })
        setActiveDesign(created)
        setSaveSuccessMsg(true)
      } else {
        const updated = await updateDesignMutation.mutateAsync({
          designId: activeDesign.id,
          expectedRevision: activeDesign.revision,
          title: designTitle.trim() || activeDesign.title,
          composition,
        })
        setActiveDesign(updated)
        setSaveSuccessMsg(true)
      }
    } catch (err: any) {
      if (err instanceof RevisionConflictError || err?.status === 409) {
        setConflictMessage(
          'Conflict: This design was updated elsewhere. Your unsaved changes are preserved locally.',
        )
      } else {
        setConflictMessage(err?.message || 'Failed to save card design.')
      }
    }
  }, [activeDesign, createDesignMutation, updateDesignMutation, designTitle, composition])

  // ---------------------------------------------------------------------------
  // Publish Release (Inline Drawer Action)
  // ---------------------------------------------------------------------------
  const handleConfirmPublish = useCallback(async () => {
    setIsPublishing(true)
    setConflictMessage(null)
    setPublishSuccessMsg(null)
    try {
      // 1. Require a real selected subject for publication
      const subjectName = (
        publishSubjectName ||
        activeProfile?.displayName ||
        (activeCardTypeId !== 'minimal' ? currentContentStore.input1 : '') ||
        ''
      ).trim()

      if (!activeProfile && !subjectName) {
        setConflictMessage('A real selected subject is required for publication.')
        setIsPublishing(false)
        return
      }

      // 2. Validate required card-type fields
      for (const field of activeCardType.fields) {
        if (field.required) {
          const bound = boundFields.find((bf) => bf.fieldId === field.id)
          let val = (bound?.effectiveValue || currentContentStore[bound?.slotId || ''] || '').trim()
          if (
            !val &&
            (field.id === 'name' ||
              field.id === 'subject' ||
              field.id === 'recipient' ||
              field.id === 'presenter' ||
              field.id === 'artist' ||
              field.id === 'athleteName' ||
              field.id === 'author' ||
              field.id === 'speaker' ||
              field.id === 'alias') &&
            subjectName
          ) {
            val = subjectName
          }
          if (!val) {
            setConflictMessage(`"${field.label}" is required for ${activeCardType.name}.`)
            setIsPublishing(false)
            return
          }
        }
      }

      // 3. Ensure design is saved
      let currentDesign = activeDesign
      if (!currentDesign) {
        currentDesign = await createDesignMutation.mutateAsync({
          title: designTitle.trim() || 'Untitled Collectible',
          composition,
        })
        setActiveDesign(currentDesign)
      } else {
        currentDesign = await updateDesignMutation.mutateAsync({
          designId: currentDesign.id,
          expectedRevision: currentDesign.revision,
          title: designTitle.trim() || currentDesign.title,
          composition,
        })
        setActiveDesign(currentDesign)
      }

      // 4. Explicit Subject Attribution
      let personId: string
      if (activeProfile?.id) {
        personId = activeProfile.id
      } else {
        const matched = people.find(
          (p) => p.displayName?.toLowerCase() === subjectName.toLowerCase(),
        )
        if (matched) {
          personId = matched.id
        } else {
          const created = await createPerson({
            displayName: subjectName,
            bio: publishSubjectBio.trim() || undefined,
          })
          personId = created.data.id
        }
      }

      // 3. Create release with explicit edition configuration
      const editionSizeNum =
        publishEditionMode === 'LIMITED' ? Math.max(1, parseInt(publishEditionSize, 10) || 25) : null

      const requestId = generateStableRequestId('rel')
      const release = await createReleaseMutation.mutateAsync({
        templateId: currentDesign.id,
        expectedRevision: currentDesign.revision,
        personProfileId: personId,
        title: currentDesign.title,
        editionMode: publishEditionMode,
        editionSize: editionSizeNum,
        requestId,
        sourceImageAssetId: selectedImageId,
      })

      // 4. Generate snapshot & publish
      await generateReleaseMutation.mutateAsync(release.id)
      await publishReleaseMutation.mutateAsync({ releaseId: release.id, visibility: 'PUBLIC' })

      setPublishSuccessMsg(`Release #${release.id.slice(0, 8)} published!`)
      setIsPublishDrawerOpen(false)

      // Navigate to storefront or release
      if (currentUsername) {
        router.push(`/storefronts/${currentUsername}` as any)
      } else {
        router.push(`/cards/${release.id}` as any)
      }
    } catch (err: any) {
      if (err instanceof RevisionConflictError || err?.status === 409) {
        setConflictMessage(
          'Conflict: Design was updated elsewhere. Your unsaved changes are preserved locally.',
        )
      } else {
        setConflictMessage(err?.message || 'Failed to publish release.')
      }
    } finally {
      setIsPublishing(false)
    }
  }, [
    activeDesign,
    createDesignMutation,
    updateDesignMutation,
    designTitle,
    composition,
    publishSubjectName,
    activeProfile?.displayName,
    currentContentStore.input1,
    currentContentStore.input3,
    people,
    createPerson,
    publishSubjectBio,
    publishEditionMode,
    publishEditionSize,
    selectedImageId,
    createReleaseMutation,
    generateReleaseMutation,
    publishReleaseMutation,
    currentUsername,
    router,
  ])

  const isSaving = createDesignMutation.isPending || updateDesignMutation.isPending

  return {
    // Auth & Navigation
    currentUsername,

    // Document & Saved Designs
    activeDesign,
    designTitle,
    setDesignTitle,
    savedDesigns,
    savedDesignsDropdownOpen,
    setSavedDesignsDropdownOpen,
    handleSelectSavedDesign,
    handleStartNewDesign,
    handleSaveDesign,
    isSaving,
    saveSuccessMsg,
    setSaveSuccessMsg,

    // Undo / Redo History
    historyIndex,
    historyLength: history.length,
    handleUndo,
    handleRedo,

    // Subject Identity & Profile
    activeProfile,
    personDropdownOpen,
    setPersonDropdownOpen,
    togglePersonDropdown,
    handleSelectPersonProfile,
    customPeople: people,

    // Card Type Selection
    activeCardTypeId,
    activeCardType,
    cardTypeDropdownOpen,
    setCardTypeDropdownOpen,
    toggleCardTypeDropdown,
    handleSelectCardType,

    // Content Fields & Linking
    boundFields,
    handleUpdatePositionalInput,
    handleRelinkField,

    // Flagship Design
    activeFlagshipId,
    activeFlagship,
    designDropdownOpen,
    setDesignDropdownOpen,
    toggleDesignDropdown,
    handleSelectFlagshipDesign,
    currentFlagshipResult,

    // Media Library & Artwork
    selectedImageId,
    mediaCategoryFilter,
    setMediaCategoryFilter,
    displayedMediaItems,
    assetsList,
    handleSelectArtwork,
    handlePickCustomImage,

    // Publishing Drawer
    isPublishDrawerOpen,
    setIsPublishDrawerOpen,
    publishSubjectName,
    setPublishSubjectName,
    publishSubjectBio,
    setPublishSubjectBio,
    publishEditionMode,
    setPublishEditionMode,
    publishEditionSize,
    setPublishEditionSize,
    isPublishing,
    handleConfirmPublish,

    // Feedback Alerts
    conflictMessage,
    publishSuccessMsg,

    // 3-Level Panel Navigation
    panelLocation,
    navigateTo,
    navigateBack,
    breadcrumbs,

    // Appearance State & Levers
    appearance,
    handleUpdateAppearance,
    handleUnlinkSubject,

    // Core Canvas Composition
    composition,
  }
}
