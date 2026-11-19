import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useStudioUser } from './hooks/useStudioUser'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import {
  useCardDesigns,
  useCreateCardDesign,
  useUpdateCardDesign,
  RevisionConflictError,
  type CardDesign,
  type CardComposition,
} from './hooks/useCardDesigns'
import {
  useCreateRelease,
  useGenerateRelease,
  usePublishRelease,
  generateStableRequestId,
  type CardEditionMode,
} from './hooks/useReleases'
import { usePersonSelector } from './hooks/usePersonSelector'
import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  getFlagshipDesignById,
  INITIAL_CONTENT_STORE,
  type ContentStore,
} from '@/modules/designs/flagshipDesigns'
import {
  CARD_TYPES,
  getCardTypeById,
  type CardType,
} from '@/modules/designs/cardTypes'
import {
  CURATED_ARTWORKS,
  DEFAULT_ARTWORK,
  getArtworkById,
  type ArtworkPreset,
} from '@/modules/designs/curatedArtwork'
import {
  UniversalProfile,
  BENCHMARK_PROFILES,
  toUniversalProfile,
  getSpecializationMeta,
  type SpecializationType,
} from '@/modules/profiles/profileTaxonomy'
import {
  buildBoundCardFields,
  type BoundCardField,
} from '@/modules/profiles/profileAttributeResolver'
import {
  useUnifiedMediaLibrary,
  type MediaLibraryItem,
} from '@/modules/media/useUnifiedMediaLibrary'
import { areFontsReady, waitForFontsLoaded } from '@/modules/typography/textFit'
import {
  Save,
  Undo2,
  Redo2,
  Rocket,
  AlertTriangle,
  ChevronDown,
  Check,
  FolderOpen,
  Plus,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  Layers,
  Link2,
  RotateCcw,
  User,
  Film,
  Music,
  Trophy,
  BookOpen,
} from 'lucide-react-native'

const INITIAL_FLAGSHIP_ID = 'classic-collector'
const INITIAL_CARD_TYPE_ID = 'profile'
const INITIAL_IMAGE_ID = 'art-angelou'

const INITIAL_COMPILATION = compileFlagshipDesign(
  INITIAL_FLAGSHIP_ID,
  INITIAL_CONTENT_STORE,
  undefined,
  undefined,
  INITIAL_CARD_TYPE_ID,
  INITIAL_IMAGE_ID,
)

export function CardStudioScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ flagshipId?: string }>()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  // Font loading readiness
  const [fontsLoaded, setFontsLoaded] = useState(() => areFontsReady())

  // Auth / Current user
  const { username: currentUsername } = useStudioUser()

  // Saved Designs & Mutations
  const { data: savedDesigns = [] } = useCardDesigns()
  const createDesignMutation = useCreateCardDesign()
  const updateDesignMutation = useUpdateCardDesign()

  // Releases mutations & Person lookup
  const createReleaseMutation = useCreateRelease()
  const generateReleaseMutation = useGenerateRelease()
  const publishReleaseMutation = usePublishRelease()
  const { people, createPerson } = usePersonSelector()

  // Active Subject Person Profile (Universal Profile & Specializations)
  const [activeProfile, setActiveProfile] = useState<UniversalProfile>(BENCHMARK_PROFILES[0])
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false)

  // Active Design state
  const [activeDesign, setActiveDesign] = useState<CardDesign | null>(null)
  const [designTitle, setDesignTitle] = useState('Untitled Collectible')

  // Card Type, Flagship & Artwork State
  const [activeCardTypeId, setActiveCardTypeId] = useState<string>(INITIAL_CARD_TYPE_ID)
  const [activeFlagshipId, setActiveFlagshipId] = useState<string>(
    params.flagshipId || INITIAL_FLAGSHIP_ID,
  )
  const [selectedImageId, setSelectedImageId] = useState<string>(INITIAL_IMAGE_ID)

  // Linked content overrides & unlinked slots
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({})
  const [unlinkedSlotIds, setUnlinkedSlotIds] = useState<Set<string>>(new Set())

  // Dropdown open states
  const [savedDesignsDropdownOpen, setSavedDesignsDropdownOpen] = useState(false)
  const [cardTypeDropdownOpen, setCardTypeDropdownOpen] = useState(false)
  const [designDropdownOpen, setDesignDropdownOpen] = useState(false)

  // Unified Media Library
  const mediaLibrary = useUnifiedMediaLibrary({ personProfileId: activeProfile?.id })
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<'ALL' | 'USER' | 'PROFILE' | 'CURATED'>('ALL')

  // Composition & Local History (Undo/Redo)
  const [composition, setComposition] = useState<CardComposition>(INITIAL_COMPILATION.composition)
  const [history, setHistory] = useState<CardComposition[]>([INITIAL_COMPILATION.composition])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Inline Publishing Drawer State
  const [isPublishDrawerOpen, setIsPublishDrawerOpen] = useState(false)
  const [publishSubjectName, setPublishSubjectName] = useState(activeProfile?.displayName || 'MAYA ANGELOU')
  const [publishSubjectBio, setPublishSubjectBio] = useState(activeProfile?.bio || '')
  const [publishEditionMode, setPublishEditionMode] = useState<CardEditionMode>('LIMITED')
  const [publishEditionSize, setPublishEditionSize] = useState('25')

  // Status & Feedback
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  // Active Entities
  const activeCardType = getCardTypeById(activeCardTypeId)
  const activeFlagship = getFlagshipDesignById(activeFlagshipId) || FLAGSHIP_DESIGNS[0]

  // Compute Bound Fields from Universal Profile & Overrides
  const boundFields = useMemo<BoundCardField[]>(() => {
    return buildBoundCardFields(
      activeCardType,
      activeProfile,
      activeFlagship.inputs.map((i) => i.id),
      fieldOverrides,
      unlinkedSlotIds,
    )
  }, [activeCardType, activeProfile, activeFlagship, fieldOverrides, unlinkedSlotIds])

  // Derive full content store for compilation
  const currentContentStore = useMemo<ContentStore>(() => {
    const store: ContentStore = { ...INITIAL_CONTENT_STORE }
    for (const bf of boundFields) {
      store[bf.slotId] = bf.effectiveValue
    }
    // Retain any additional overrides
    for (const [k, v] of Object.entries(fieldOverrides)) {
      store[k] = v
    }
    return store
  }, [boundFields, fieldOverrides])

  // Compile current flagship composition
  const currentFlagshipResult = compileFlagshipDesign(
    activeFlagshipId,
    currentContentStore,
    undefined,
    undefined,
    activeCardTypeId,
    selectedImageId,
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
          undefined,
          undefined,
          activeCardTypeId,
          selectedImageId,
        )
        setComposition(result.composition)
      }
    })
    return () => {
      active = false
    }
  }, [fontsLoaded, activeFlagshipId, currentContentStore, activeCardTypeId, selectedImageId])

  // Push to history when composition changes
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

  // --- Undo & Redo ---
  function handleUndo() {
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
      }
    }
  }

  function handleRedo() {
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
      }
    }
  }

  // --- Subject Profile Selection ---
  function handleSelectPersonProfile(person: any) {
    const universal = toUniversalProfile(person)
    setActiveProfile(universal)
    setPersonDropdownOpen(false)
    setPublishSubjectName(universal.displayName)
    setPublishSubjectBio(universal.bio || '')

    // Resolve new bound fields and update composition
    const newBound = buildBoundCardFields(
      activeCardType,
      universal,
      activeFlagship.inputs.map((i) => i.id),
      fieldOverrides,
      unlinkedSlotIds,
    )
    const newStore: ContentStore = { ...currentContentStore }
    for (const bf of newBound) {
      newStore[bf.slotId] = bf.effectiveValue
    }

    const result = compileFlagshipDesign(
      activeFlagshipId,
      newStore,
      undefined,
      undefined,
      activeCardTypeId,
      selectedImageId,
    )
    updateCompositionWithHistory(result.composition)
  }

  // --- Saved Designs Loading ---
  function handleSelectSavedDesign(design: CardDesign) {
    setActiveDesign(design)
    setDesignTitle(design.title)
    setSavedDesignsDropdownOpen(false)

    const meta = (design.composition as any)?.metadata?.flagship
    const loadedFlagshipId = meta?.id || INITIAL_FLAGSHIP_ID
    const loadedCardTypeId = meta?.cardTypeId || INITIAL_CARD_TYPE_ID
    const loadedImageId = meta?.selectedImageId || INITIAL_IMAGE_ID
    const loadedContent = meta?.contentStore || meta?.inputs || INITIAL_CONTENT_STORE

    setActiveFlagshipId(loadedFlagshipId)
    setActiveCardTypeId(loadedCardTypeId)
    setSelectedImageId(loadedImageId)
    setFieldOverrides(loadedContent)

    const result = compileFlagshipDesign(
      loadedFlagshipId,
      loadedContent,
      undefined,
      undefined,
      loadedCardTypeId,
      loadedImageId,
    )
    setComposition(result.composition)
    setHistory([result.composition])
    setHistoryIndex(0)
    setSaveSuccessMsg(false)
  }

  function handleStartNewDesign() {
    setActiveDesign(null)
    setDesignTitle('Untitled Collectible')
    setSavedDesignsDropdownOpen(false)
    setActiveFlagshipId(INITIAL_FLAGSHIP_ID)
    setActiveCardTypeId(INITIAL_CARD_TYPE_ID)
    setSelectedImageId(INITIAL_IMAGE_ID)
    setFieldOverrides({})
    setUnlinkedSlotIds(new Set())
    setActiveProfile(BENCHMARK_PROFILES[0])

    const result = compileFlagshipDesign(
      INITIAL_FLAGSHIP_ID,
      INITIAL_CONTENT_STORE,
      undefined,
      undefined,
      INITIAL_CARD_TYPE_ID,
      INITIAL_IMAGE_ID,
    )
    setComposition(result.composition)
    setHistory([result.composition])
    setHistoryIndex(0)
    setSaveSuccessMsg(false)
  }

  // --- Card Type Selection ---
  function handleSelectCardType(typeId: string) {
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
    const newStore: ContentStore = { ...currentContentStore }
    for (const bf of newBound) {
      newStore[bf.slotId] = bf.effectiveValue
    }

    const result = compileFlagshipDesign(
      activeFlagshipId,
      newStore,
      undefined,
      undefined,
      typeId,
      selectedImageId,
    )
    updateCompositionWithHistory(result.composition)
  }

  // --- Flagship Design Selection ---
  function handleSelectFlagshipDesign(designId: string) {
    setActiveFlagshipId(designId)
    setDesignDropdownOpen(false)

    const result = compileFlagshipDesign(
      designId,
      currentContentStore,
      undefined,
      undefined,
      activeCardTypeId,
      selectedImageId,
    )
    updateCompositionWithHistory(result.composition)
  }

  // --- Content Input Updating & Override Management ---
  function handleUpdatePositionalInput(slotId: string, value: string) {
    setFieldOverrides((prev) => {
      const nextOverrides = { ...prev, [slotId]: value }
      const nextStore = { ...currentContentStore, [slotId]: value }
      const result = compileFlagshipDesign(
        activeFlagshipId,
        nextStore,
        undefined,
        undefined,
        activeCardTypeId,
        selectedImageId,
      )
      updateCompositionWithHistory(result.composition)
      return nextOverrides
    })
  }

  // --- Re-link Field to Profile Attribute ---
  function handleRelinkField(slotId: string) {
    setFieldOverrides((prev) => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
    setUnlinkedSlotIds((prev) => {
      const next = new Set(prev)
      next.delete(slotId)
      return next
    })

    // Recompute with cleared override
    const clearedOverrides = { ...fieldOverrides }
    delete clearedOverrides[slotId]
    const nextBound = buildBoundCardFields(
      activeCardType,
      activeProfile,
      activeFlagship.inputs.map((i) => i.id),
      clearedOverrides,
      unlinkedSlotIds,
    )
    const nextStore: ContentStore = { ...currentContentStore }
    for (const bf of nextBound) {
      nextStore[bf.slotId] = bf.effectiveValue
    }

    const result = compileFlagshipDesign(
      activeFlagshipId,
      nextStore,
      undefined,
      undefined,
      activeCardTypeId,
      selectedImageId,
    )
    updateCompositionWithHistory(result.composition)
  }

  // --- Artwork Selection & Upload (Unified Media Library) ---
  function handleSelectArtwork(artworkId: string) {
    setSelectedImageId(artworkId)
    const result = compileFlagshipDesign(
      activeFlagshipId,
      currentContentStore,
      undefined,
      undefined,
      activeCardTypeId,
      artworkId,
    )
    updateCompositionWithHistory(result.composition)
  }

  async function handlePickCustomImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
      })
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri
        // Register into reusable user library
        const registered = mediaLibrary.registerUploadedMedia({
          id: imageUri,
          url: imageUri,
          label: `${activeProfile?.displayName || 'Custom'} Artwork`,
          category: 'Upload',
        })
        handleSelectArtwork(registered.id)
      }
    } catch (err) {
      console.warn('Failed to pick image:', err)
    }
  }

  // Filtered media items based on active tab
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

  // --- Design Save ---
  async function handleSaveDesign() {
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
  }

  // --- Publish Release (Lightweight Inline Workflow) ---
  async function handleConfirmPublish() {
    setIsPublishing(true)
    setConflictMessage(null)
    setPublishSuccessMsg(null)
    try {
      // 1. Ensure design is saved
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

      // 2. Explicit Subject Attribution
      const subjectName = (publishSubjectName || activeProfile?.displayName || currentContentStore.input1 || designTitle || 'Creator').trim()
      let personId: string
      const matched = people.find(
        (p) => p.displayName?.toLowerCase() === subjectName.toLowerCase(),
      )
      if (matched) {
        personId = matched.id
      } else {
        const created = await createPerson({
          displayName: subjectName,
          bio: publishSubjectBio.trim() || currentContentStore.input3?.slice(0, 500) || undefined,
        })
        personId = created.data.id
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
        setConflictMessage('Conflict: Design was updated elsewhere. Your unsaved changes are preserved locally.')
      } else {
        setConflictMessage(err?.message || 'Failed to publish release.')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const isSaving = createDesignMutation.isPending || updateDesignMutation.isPending
  // Generous stage width for the card to dominate visually
  const canvasWidth = isDesktop ? 440 : Math.min(340, width - 32)

  return (
    <Screen title="Card Studio" withBack scroll>
      {/* Top Action Bar */}
      <View className="mb-md flex-row flex-wrap items-center justify-between gap-sm border-b border-border pb-md">
        {/* Left: Design Title & Revision Badge */}
        <View className="flex-1 min-w-[200px] flex-row items-center gap-xs">
          <Input
            value={designTitle}
            onChangeText={(t) => {
              setDesignTitle(t)
              setSaveSuccessMsg(false)
            }}
            placeholder="Design title..."
            className="flex-1 font-bold text-lg"
          />
          {activeDesign ? (
            <View className="rounded-full bg-brand/10 px-sm py-xs">
              <Text className="text-xs font-bold text-brand">v{activeDesign.revision}</Text>
            </View>
          ) : (
            <View className="rounded-full bg-muted-text/10 px-sm py-xs">
              <Text className="text-xs font-semibold text-muted-text">Draft</Text>
            </View>
          )}
        </View>

        {/* Saved Designs Dropdown */}
        <View className="relative">
          <Button
            testID="saved-designs-dropdown"
            size="sm"
            variant="ghost"
            icon={FolderOpen}
            onPress={() => setSavedDesignsDropdownOpen(!savedDesignsDropdownOpen)}
          >
            {activeDesign ? activeDesign.title.slice(0, 16) : `Saved (${savedDesigns.length})`}
          </Button>

          {savedDesignsDropdownOpen && (
            <View className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-card-surface shadow-xl p-xs">
              <Pressable
                testID="new-design-option"
                onPress={handleStartNewDesign}
                className="flex-row items-center gap-sm rounded-lg px-md py-sm hover:bg-canvas border-b border-border/40"
              >
                <Plus size={16} className="text-brand" />
                <Text className="text-sm font-semibold text-brand">+ New Collectible</Text>
              </Pressable>

              <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }} className="pt-xs">
                {savedDesigns.length === 0 ? (
                  <View className="p-sm">
                    <Text variant="caption" className="text-center">No saved designs yet</Text>
                  </View>
                ) : (
                  savedDesigns.map((d) => {
                    const isSelected = activeDesign?.id === d.id
                    return (
                      <Pressable
                        key={d.id}
                        testID={`saved-design-${d.id}`}
                        onPress={() => handleSelectSavedDesign(d)}
                        className={`flex-row items-center justify-between rounded-lg px-md py-sm ${
                          isSelected ? 'bg-brand/10' : 'hover:bg-canvas'
                        }`}
                      >
                        <View className="flex-1">
                          <Text
                            className={`text-sm ${
                              isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                            }`}
                            numberOfLines={1}
                          >
                            {d.title}
                          </Text>
                          <Text variant="caption">v{d.revision}</Text>
                        </View>
                        {isSelected && <Check size={16} className="text-brand" />}
                      </Pressable>
                    )
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Action buttons: Undo, Redo, Save, Publish */}
        <View className="flex-row items-center gap-xs">
          <Button
            size="sm"
            variant="ghost"
            icon={Undo2}
            disabled={historyIndex <= 0}
            onPress={handleUndo}
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Redo2}
            disabled={historyIndex >= history.length - 1}
            onPress={handleRedo}
          >
            Redo
          </Button>
          <Button
            testID="save-design-button"
            size="sm"
            variant={saveSuccessMsg ? 'secondary' : 'ghost'}
            icon={Save}
            isLoading={isSaving}
            onPress={handleSaveDesign}
          >
            {saveSuccessMsg ? 'Saved' : 'Save'}
          </Button>
          <Button
            testID="publish-release-button"
            size="sm"
            variant="primary"
            icon={Rocket}
            isLoading={isPublishing}
            onPress={() => setIsPublishDrawerOpen(!isPublishDrawerOpen)}
          >
            Publish Release
          </Button>
        </View>
      </View>

      {/* Notifications / Alerts */}
      {conflictMessage && (
        <View className="mb-md flex-row items-center gap-sm rounded-xl border border-warning/40 bg-warning/10 p-md">
          <AlertTriangle size={20} className="text-warning flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-warning">{conflictMessage}</Text>
          </View>
        </View>
      )}

      {publishSuccessMsg && (
        <View className="mb-md flex-row items-center gap-sm rounded-xl border border-success/40 bg-success/10 p-md">
          <Check size={20} className="text-success flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-success">{publishSuccessMsg}</Text>
          </View>
        </View>
      )}

      {/* Main Studio Work Area: Controls on Left (~42%), Card on Right (~58%) */}
      <View className={`gap-xl ${isDesktop ? 'flex-row items-start' : 'flex-col-reverse items-center'}`}>
        {/* LEFT COLUMN: Controls Panel */}
        <View style={{ width: isDesktop ? '42%' : '100%' }} className="gap-md">
          {/* INLINE PUBLISHING CONFIGURATION DRAWER */}
          {isPublishDrawerOpen && (
            <View
              testID="inline-publish-drawer"
              className="rounded-2xl border-2 border-brand/50 bg-card-surface p-md gap-md shadow-lg"
            >
              <View className="flex-row items-center justify-between border-b border-border pb-xs">
                <View className="flex-row items-center gap-xs">
                  <Rocket size={18} className="text-brand" />
                  <Text className="font-bold text-base text-text">Configure & Publish Release</Text>
                </View>
                <Pressable onPress={() => setIsPublishDrawerOpen(false)} hitSlop={8}>
                  <X size={18} className="text-muted-text" />
                </Pressable>
              </View>

              <Text variant="caption">
                Configure explicit subject attribution and edition limits before publishing.
              </Text>

              {/* Subject Name */}
              <View className="gap-1">
                <Text className="text-xs font-semibold text-text">Subject Attribution</Text>
                <Input
                  testID="publish-subject-name-input"
                  value={publishSubjectName}
                  onChangeText={setPublishSubjectName}
                  placeholder="Subject's full name..."
                />
              </View>

              {/* Subject Calling / Bio */}
              <View className="gap-1">
                <Text className="text-xs font-semibold text-text">Calling / Profession (Optional)</Text>
                <Input
                  testID="publish-subject-bio-input"
                  value={publishSubjectBio}
                  onChangeText={setPublishSubjectBio}
                  placeholder="e.g. Poet, Author, Track Athlete..."
                />
              </View>

              {/* Edition Mode */}
              <View className="gap-1" testID="publish-edition-mode-selector">
                <Text className="text-xs font-semibold text-text">Edition Mode</Text>
                <View className="flex-row gap-xs">
                  <Pressable
                    testID="edition-mode-limited"
                    onPress={() => setPublishEditionMode('LIMITED')}
                    className={`flex-1 rounded-xl border p-sm items-center justify-center ${
                      publishEditionMode === 'LIMITED'
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        publishEditionMode === 'LIMITED' ? 'text-brand' : 'text-text'
                      }`}
                    >
                      Limited
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="edition-mode-one-of-one"
                    onPress={() => setPublishEditionMode('ONE_OF_ONE')}
                    className={`flex-1 rounded-xl border p-sm items-center justify-center ${
                      publishEditionMode === 'ONE_OF_ONE'
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        publishEditionMode === 'ONE_OF_ONE' ? 'text-brand' : 'text-text'
                      }`}
                    >
                      1 of 1
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="edition-mode-unlimited"
                    onPress={() => setPublishEditionMode('UNLIMITED')}
                    className={`flex-1 rounded-xl border p-sm items-center justify-center ${
                      publishEditionMode === 'UNLIMITED'
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        publishEditionMode === 'UNLIMITED' ? 'text-brand' : 'text-text'
                      }`}
                    >
                      Open
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Edition Size (when LIMITED) */}
              {publishEditionMode === 'LIMITED' && (
                <View className="gap-1">
                  <Text className="text-xs font-semibold text-text">Numbered Copies</Text>
                  <Input
                    testID="publish-edition-size-input"
                    value={publishEditionSize}
                    onChangeText={setPublishEditionSize}
                    keyboardType="number-pad"
                    placeholder="25"
                  />
                </View>
              )}

              {/* Confirm / Cancel Buttons */}
              <View className="flex-row items-center justify-end gap-xs pt-xs border-t border-border">
                <Button
                  testID="cancel-publish-button"
                  size="sm"
                  variant="ghost"
                  onPress={() => setIsPublishDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  testID="confirm-publish-button"
                  size="sm"
                  variant="primary"
                  icon={Rocket}
                  isLoading={isPublishing}
                  onPress={handleConfirmPublish}
                >
                  Confirm & Publish
                </Button>
              </View>
            </View>
          )}

          {/* MAIN EDITOR CARD */}
          <View className="rounded-2xl border border-border bg-surface p-md gap-lg shadow-sm">
            {/* 1. SUBJECT PROFILE SELECTOR (LINKED IDENTITY) */}
            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
                  Subject Profile
                </Text>
                <View className="flex-row gap-1">
                  {activeProfile?.specializations.map((spec) => {
                    const meta = getSpecializationMeta(spec.type)
                    return (
                      <View key={spec.type} className="rounded bg-brand/10 px-1.5 py-0.5">
                        <Text className="text-[10px] font-bold text-brand">{meta.label}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>

              <Pressable
                testID="person-selector-dropdown"
                onPress={() => setPersonDropdownOpen(!personDropdownOpen)}
                className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm"
              >
                <View className="flex-row items-center gap-sm flex-1">
                  <View className="h-8 w-8 rounded-full bg-brand/10 items-center justify-center">
                    <User size={16} className="text-brand" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-sm text-text">{activeProfile?.displayName}</Text>
                    <Text variant="caption" numberOfLines={1}>
                      {activeProfile?.originEra || activeProfile?.hometown || 'Universal Profile'}
                    </Text>
                  </View>
                </View>
                <ChevronDown size={18} className="text-muted-text ml-sm" />
              </Pressable>

              {personDropdownOpen && (
                <View className="mt-xs max-h-64 rounded-xl border border-border bg-card-surface shadow-xl overflow-hidden z-20">
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
                    <Text variant="caption" className="px-md py-1 font-bold text-muted-text bg-canvas">
                      Benchmark Cultural Profiles
                    </Text>
                    {BENCHMARK_PROFILES.map((p) => {
                      const isSelected = p.id === activeProfile?.id
                      return (
                        <Pressable
                          key={p.id}
                          testID={`benchmark-person-${p.slug}`}
                          onPress={() => handleSelectPersonProfile(p)}
                          className={`flex-row items-center justify-between px-md py-sm border-b border-border/50 ${
                            isSelected ? 'bg-brand/10' : 'hover:bg-canvas'
                          }`}
                        >
                          <View className="flex-1">
                            <Text
                              className={`text-sm ${
                                isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                              }`}
                            >
                              {p.displayName}
                            </Text>
                            <Text variant="caption" numberOfLines={1}>
                              {p.specializations.map((s) => s.type).join(' · ')}
                            </Text>
                          </View>
                          {isSelected && <Check size={16} className="text-brand flex-shrink-0" />}
                        </Pressable>
                      )
                    })}

                    {people && people.length > 0 && (
                      <>
                        <Text variant="caption" className="px-md py-1 font-bold text-muted-text bg-canvas">
                          Your Custom Profiles
                        </Text>
                        {people.map((p) => (
                          <Pressable
                            key={p.id}
                            testID={`custom-person-${p.id}`}
                            onPress={() => handleSelectPersonProfile(p)}
                            className="flex-row items-center justify-between px-md py-sm border-b border-border/50 hover:bg-canvas"
                          >
                            <Text className="text-sm font-medium text-text">{p.displayName}</Text>
                          </Pressable>
                        ))}
                      </>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 2. CARD TYPE DROPDOWN (ABOVE CONTENT) */}
            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
                  Card Type
                </Text>
                <View className="rounded-full bg-brand/10 px-sm py-0.5">
                  <Text className="text-[10px] font-bold text-brand">{activeCardType.badge}</Text>
                </View>
              </View>

              <Pressable
                testID="card-type-dropdown"
                onPress={() => setCardTypeDropdownOpen(!cardTypeDropdownOpen)}
                className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm"
              >
                <View className="flex-1">
                  <Text className="font-semibold text-sm text-text">{activeCardType.name}</Text>
                  <Text variant="caption" numberOfLines={1}>{activeCardType.description}</Text>
                </View>
                <ChevronDown size={18} className="text-muted-text ml-sm" />
              </Pressable>

              {cardTypeDropdownOpen && (
                <View className="mt-xs max-h-64 rounded-xl border border-border bg-card-surface shadow-xl overflow-hidden z-10">
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
                    {CARD_TYPES.map((t) => {
                      const isSelected = t.id === activeCardTypeId
                      return (
                        <Pressable
                          key={t.id}
                          testID={`card-type-option-${t.id}`}
                          onPress={() => handleSelectCardType(t.id)}
                          className={`flex-row items-center justify-between px-md py-sm border-b border-border/50 ${
                            isSelected ? 'bg-brand/10' : 'hover:bg-canvas'
                          }`}
                        >
                          <View className="flex-1 mr-sm">
                            <View className="flex-row items-center gap-xs">
                              <Text
                                className={`text-sm ${
                                  isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                                }`}
                              >
                                {t.name}
                              </Text>
                              <View className="rounded bg-muted-text/10 px-1.5 py-0.5">
                                <Text className="text-[10px] font-bold text-muted-text">{t.badge}</Text>
                              </View>
                            </View>
                            <Text variant="caption" numberOfLines={1}>{t.description}</Text>
                          </View>
                          {isSelected && <Check size={16} className="text-brand flex-shrink-0" />}
                        </Pressable>
                      )
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 3. CONTENT FIELDS (IN MIDDLE) WITH LINKED DATA BADGES */}
            <View className="gap-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
                  Content Fields
                </Text>
                <Text variant="caption">
                  {Math.min(activeCardType.fields.length, activeFlagship.inputs.length)} of {activeCardType.fields.length} active in design
                </Text>
              </View>

              {/* Dynamic inputs for active card type */}
              <View className="gap-sm">
                {boundFields.map((field) => {
                  const isOverflow = field.isMappedInDesign ? currentFlagshipResult.isOverflow[field.slotId] : false

                  return (
                    <View key={field.slotId} className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-xs">
                          <Text className="text-xs font-semibold text-text">
                            {field.label}
                          </Text>
                          {/* Linked Attribute Badge */}
                          {field.isLinked ? (
                            <View className="flex-row items-center gap-0.5 rounded-full bg-brand/10 px-1.5 py-0.2">
                              <Link2 size={10} className="text-brand" />
                              <Text className="text-[9px] font-bold text-brand">
                                {field.linkedSourceLabel || 'Profile'}
                              </Text>
                            </View>
                          ) : field.overrideValue !== undefined ? (
                            <View className="flex-row items-center gap-1">
                              <View className="rounded bg-warning/10 px-1.5 py-0.2">
                                <Text className="text-[9px] font-bold text-warning">Override</Text>
                              </View>
                              <Pressable
                                testID={`relink-${field.slotId}`}
                                onPress={() => handleRelinkField(field.slotId)}
                                hitSlop={6}
                                className="flex-row items-center gap-0.5 rounded bg-muted-text/10 px-1 py-0.2"
                              >
                                <RotateCcw size={9} className="text-muted-text" />
                                <Text className="text-[9px] font-semibold text-muted-text">Re-link</Text>
                              </Pressable>
                            </View>
                          ) : null}
                        </View>

                        {!field.isMappedInDesign ? (
                          <View className="rounded bg-neutral-200/50 dark:bg-neutral-800 px-1.5 py-0.5">
                            <Text className="text-[10px] font-medium text-muted-text">
                              Preserved (not in this design)
                            </Text>
                          </View>
                        ) : isOverflow ? (
                          <Text className="text-[10px] font-bold text-warning">Text Overflow</Text>
                        ) : null}
                      </View>

                      <Input
                        testID={`slot-${field.slotId}`}
                        value={field.effectiveValue}
                        onChangeText={(t) => handleUpdatePositionalInput(field.slotId, t)}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        multiline={field.multiline}
                        numberOfLines={field.maxLines || 1}
                      />
                    </View>
                  )
                })}
              </View>
            </View>

            {/* 4. DESIGN PICKER DROPDOWN (BELOW CONTENT) */}
            <View className="pt-sm border-t border-border gap-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
                Flagship Design
              </Text>
              <Pressable
                testID="design-picker-dropdown"
                onPress={() => setDesignDropdownOpen(!designDropdownOpen)}
                className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm"
              >
                <View className="flex-row items-center gap-sm">
                  <View
                    style={{ backgroundColor: activeFlagship.palette.background }}
                    className="h-4 w-4 rounded-full border border-border"
                  />
                  <Text className="font-semibold text-sm text-text">
                    {activeFlagship.name}
                  </Text>
                  <Text variant="caption">({activeFlagship.family})</Text>
                </View>
                <ChevronDown size={18} className="text-muted-text" />
              </Pressable>

              {designDropdownOpen && (
                <View className="mt-xs max-h-64 rounded-xl border border-border bg-card-surface shadow-xl overflow-hidden">
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }}>
                    {FLAGSHIP_DESIGNS.map((d) => {
                      const isSelected = d.id === activeFlagshipId
                      return (
                        <Pressable
                          key={d.id}
                          testID={`design-option-${d.id}`}
                          onPress={() => handleSelectFlagshipDesign(d.id)}
                          className={`flex-row items-center justify-between px-md py-sm border-b border-border/50 ${
                            isSelected ? 'bg-brand/10' : 'hover:bg-canvas'
                          }`}
                        >
                          <View className="flex-row items-center gap-sm">
                            <View
                              style={{ backgroundColor: d.palette.background }}
                              className="h-3 w-3 rounded-full border border-border"
                            />
                            <Text
                              className={`text-sm ${
                                isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                              }`}
                            >
                              {d.name}
                            </Text>
                            <Text variant="caption">{d.family}</Text>
                          </View>
                          {isSelected && <Check size={16} className="text-brand" />}
                        </Pressable>
                      )
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 5. UNIFIED MEDIA LIBRARY (ARTWORK / HERO SELECTOR) */}
            <View className="pt-sm border-t border-border gap-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
                  Card Artwork · Media Library
                </Text>
                <Button
                  testID="upload-artwork-button"
                  size="sm"
                  variant="ghost"
                  icon={Upload}
                  onPress={handlePickCustomImage}
                >
                  Upload Photo
                </Button>
              </View>

              {/* Media Filter Tabs */}
              <View className="flex-row gap-xs pb-xs">
                {(['ALL', 'USER', 'PROFILE', 'CURATED'] as const).map((tabKey) => {
                  const labels = {
                    ALL: 'All Media',
                    USER: 'User Library',
                    PROFILE: 'Profile Gallery',
                    CURATED: 'Curated RARE',
                  }
                  const isTabActive = mediaCategoryFilter === tabKey
                  return (
                    <Pressable
                      key={tabKey}
                      testID={`media-tab-${tabKey.toLowerCase()}`}
                      onPress={() => setMediaCategoryFilter(tabKey)}
                      className={`rounded-full px-2.5 py-1 ${
                        isTabActive ? 'bg-brand text-white' : 'bg-surface border border-border'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          isTabActive ? 'text-white' : 'text-muted-text'
                        }`}
                      >
                        {labels[tabKey]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              {/* Artwork presets & uploads selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-xs py-xs"
              >
                {displayedMediaItems.map((art) => {
                  const isSelected = selectedImageId === art.id
                  return (
                    <Pressable
                      key={art.id}
                      testID={`artwork-option-${art.id}`}
                      onPress={() => handleSelectArtwork(art.id)}
                      className={`relative rounded-xl overflow-hidden border-2 p-0.5 ${
                        isSelected ? 'border-brand' : 'border-transparent'
                      }`}
                    >
                      <Image
                        source={{ uri: art.url }}
                        style={{ width: 56, height: 56, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View
                          testID={`artwork-selected-${art.id}`}
                          className="absolute bottom-1 right-1 rounded-full bg-brand p-0.5"
                        >
                          <Check size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN: The Card Preview Stage (~58% width on Desktop) */}
        <View
          style={{ flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' }}
          className="items-center justify-center p-md"
        >
          <View className="sticky top-6 items-center">
            <CardCompositionRenderer
              composition={composition}
              width={canvasWidth}
              isPreview={true}
            />
          </View>
        </View>
      </View>
    </Screen>
  )
}
