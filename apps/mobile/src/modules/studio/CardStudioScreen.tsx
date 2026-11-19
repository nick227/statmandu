import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useStudioUser } from './hooks/useStudioUser'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import {
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
} from './hooks/useReleases'
import { usePersonSelector } from './hooks/usePersonSelector'
import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  getFlagshipDesignById,
  INITIAL_CONTENT_STORE,
  type ContentStore,
} from '@/modules/designs/flagshipDesigns'
import { areFontsReady, waitForFontsLoaded } from '@/modules/typography/textFit'
import {
  Save,
  Undo2,
  Redo2,
  Rocket,
  AlertTriangle,
  ChevronDown,
  Check,
} from 'lucide-react-native'

const INITIAL_FLAGSHIP_ID = 'classic-collector'
const INITIAL_FLAGSHIP_COMP = compileFlagshipDesign(INITIAL_FLAGSHIP_ID, INITIAL_CONTENT_STORE).composition

export function CardStudioScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ flagshipId?: string }>()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  // Font loading readiness
  const [fontsLoaded, setFontsLoaded] = useState(() => areFontsReady())
  useEffect(() => {
    let active = true
    waitForFontsLoaded().then(() => {
      if (active) setFontsLoaded(true)
    })
    return () => {
      active = false
    }
  }, [])

  // Auth / Current user
  const { username: currentUsername } = useStudioUser()

  // Designs mutations
  const createDesignMutation = useCreateCardDesign()
  const updateDesignMutation = useUpdateCardDesign()

  // Releases mutations & Person lookup
  const createReleaseMutation = useCreateRelease()
  const generateReleaseMutation = useGenerateRelease()
  const publishReleaseMutation = usePublishRelease()
  const { people, createPerson } = usePersonSelector()

  // Active Design state
  const [activeDesign, setActiveDesign] = useState<CardDesign | null>(null)
  const [designTitle, setDesignTitle] = useState('Untitled Collectible')

  // Flagship & Content State
  const [activeFlagshipId, setActiveFlagshipId] = useState<string>(
    params.flagshipId || INITIAL_FLAGSHIP_ID,
  )
  const [positionalInputs, setPositionalInputs] = useState<ContentStore>(INITIAL_CONTENT_STORE)
  const [designDropdownOpen, setDesignDropdownOpen] = useState(false)

  // Composition & Local History (Undo/Redo)
  const [composition, setComposition] = useState<CardComposition>(INITIAL_FLAGSHIP_COMP)
  const [history, setHistory] = useState<CardComposition[]>([INITIAL_FLAGSHIP_COMP])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Status & Feedback
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  // Active Flagship Design & Compilation info
  const activeFlagship = getFlagshipDesignById(activeFlagshipId) || FLAGSHIP_DESIGNS[0]
  const currentFlagshipResult = compileFlagshipDesign(
    activeFlagshipId,
    positionalInputs,
  )

  // Handle route param updates if navigated with flagshipId
  useEffect(() => {
    if (params.flagshipId && params.flagshipId !== activeFlagshipId) {
      setActiveFlagshipId(params.flagshipId)
      const result = compileFlagshipDesign(params.flagshipId, positionalInputs)
      setComposition(result.composition)
    }
  }, [params.flagshipId])

  // Re-fit typography when fonts finish loading
  useEffect(() => {
    if (fontsLoaded) {
      const result = compileFlagshipDesign(activeFlagshipId, positionalInputs)
      setComposition(result.composition)
    }
  }, [fontsLoaded])

  // Push to history when composition changes
  const updateCompositionWithHistory = useCallback((nextComp: CardComposition) => {
    setComposition(nextComp)
    setHistory((prev) => {
      const slice = prev.slice(0, historyIndex + 1)
      return [...slice, nextComp]
    })
    setHistoryIndex((prev) => prev + 1)
    setSaveSuccessMsg(false)
    setPublishSuccessMsg(null)
  }, [historyIndex])

  function handleUndo() {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      const prevComp = history[nextIndex]
      setComposition(prevComp)

      if (prevComp.metadata?.flagship) {
        setActiveFlagshipId(prevComp.metadata.flagship.id)
        const loadedStore = prevComp.metadata.flagship.contentStore || prevComp.metadata.flagship.inputs
        if (loadedStore) {
          setPositionalInputs((prev) => ({ ...prev, ...loadedStore }))
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
        setActiveFlagshipId(nextComp.metadata.flagship.id)
        const loadedStore = nextComp.metadata.flagship.contentStore || nextComp.metadata.flagship.inputs
        if (loadedStore) {
          setPositionalInputs((prev) => ({ ...prev, ...loadedStore }))
        }
      }
    }
  }

  // --- Flagship Selection & Input Updating ---
  function handleSelectFlagshipDesign(designId: string) {
    setActiveFlagshipId(designId)
    // Design-independent content store: switching designs NEVER deletes existing values!
    const result = compileFlagshipDesign(designId, positionalInputs)
    updateCompositionWithHistory(result.composition)
  }

  function handleUpdatePositionalInput(field: string, value: string) {
    setPositionalInputs((prev) => {
      const nextInputs: ContentStore = { ...prev, [field]: value }
      const result = compileFlagshipDesign(activeFlagshipId, nextInputs)
      updateCompositionWithHistory(result.composition)
      return nextInputs
    })
  }

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

  // --- Direct One-Click Publish Release ---
  async function handlePublishRelease() {
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

      // 2. Resolve person profile automatically from input1
      const subjectName = (positionalInputs.input1 || designTitle || 'Creator').trim()
      let personId: string
      const matched = people.find(
        (p) => p.displayName?.toLowerCase() === subjectName.toLowerCase(),
      )
      if (matched) {
        personId = matched.id
      } else {
        const created = await createPerson({
          displayName: subjectName,
          bio: positionalInputs.input3?.slice(0, 500) || undefined,
        })
        personId = created.data.id
      }

      // 3. Create release, generate snapshot & publish
      const requestId = generateStableRequestId('rel')
      const release = await createReleaseMutation.mutateAsync({
        templateId: currentDesign.id,
        expectedRevision: currentDesign.revision,
        personProfileId: personId,
        title: currentDesign.title,
        editionMode: 'LIMITED',
        editionSize: 25,
        requestId,
      })

      await generateReleaseMutation.mutateAsync(release.id)
      await publishReleaseMutation.mutateAsync({ releaseId: release.id, visibility: 'PUBLIC' })

      setPublishSuccessMsg(`Release #${release.id.slice(0, 8)} published!`)

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
  const canvasWidth = isDesktop ? 360 : Math.min(320, width - 40)

  return (
    <Screen title="Card Studio" withBack scroll>
      {/* Top Action Bar */}
      <View className="mb-md flex-row flex-wrap items-center justify-between gap-sm border-b border-border pb-md">
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
            onPress={handlePublishRelease}
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

      {/* Main Studio Work Area: Controls on Left, Card on Right */}
      <View className={`gap-lg ${isDesktop ? 'flex-row items-start' : 'flex-col-reverse items-center'}`}>
        {/* LEFT COLUMN: Content Inputs & Design Picker Dropdown */}
        <View className={`gap-md ${isDesktop ? 'flex-1' : 'w-full'}`}>
          <View className="rounded-2xl border border-border bg-surface p-md gap-md">
            <Text className="font-bold text-base text-text">Content</Text>

            {/* Dynamic Positional Inputs */}
            <View className="gap-sm">
              {activeFlagship.inputs.map((slotDef, sIdx) => {
                const fittedSize = currentFlagshipResult.fittedFontSizes[slotDef.id]
                const isOverflow = currentFlagshipResult.isOverflow[slotDef.id]
                const val = positionalInputs[slotDef.id] ?? ''

                return (
                  <View key={slotDef.id} className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-semibold text-text">
                        {slotDef.label || `Field ${sIdx + 1}`}
                      </Text>
                      {isOverflow ? (
                        <Text className="text-[10px] font-bold text-warning">Overflow</Text>
                      ) : (
                        <Text className="text-[10px] font-semibold text-muted-text">
                          {fittedSize}px
                        </Text>
                      )}
                    </View>
                    <Input
                      testID={`slot-${slotDef.id}`}
                      value={val}
                      onChangeText={(t) => handleUpdatePositionalInput(slotDef.id, t)}
                      placeholder={`Enter ${slotDef.label || slotDef.id}...`}
                      multiline={slotDef.maxLines > 1}
                      numberOfLines={Math.min(3, slotDef.maxLines)}
                    />
                  </View>
                )
              })}
            </View>

            {/* Design Picker Dropdown Under Content Fields */}
            <View className="pt-sm border-t border-border gap-1">
              <Text className="text-xs font-semibold text-text">Design</Text>
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
                <View className="mt-xs max-h-64 rounded-xl border border-border bg-card-surface shadow-lg overflow-hidden">
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }}>
                    {FLAGSHIP_DESIGNS.map((d) => {
                      const isSelected = d.id === activeFlagshipId
                      return (
                        <Pressable
                          key={d.id}
                          testID={`design-option-${d.id}`}
                          onPress={() => {
                            handleSelectFlagshipDesign(d.id)
                            setDesignDropdownOpen(false)
                          }}
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
          </View>
        </View>

        {/* RIGHT COLUMN: The Card Preview */}
        <View className="items-center justify-center p-sm sticky top-4">
          <CardCompositionRenderer
            composition={composition}
            width={canvasWidth}
            isPreview={true}
          />
        </View>
      </View>
    </Screen>
  )
}
