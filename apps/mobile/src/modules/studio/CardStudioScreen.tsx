import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useStudioUser } from './hooks/useStudioUser'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import {
  CardCompositionRenderer,
  RDC_COMPOSITION_RENDERER_VERSION,
} from '@/modules/cards/CardCompositionRenderer'
import {
  useCardDesigns,
  useCreateCardDesign,
  useUpdateCardDesign,
  RevisionConflictError,
  type CardDesign,
  type CardComposition,
  type CardCompositionLayer,
} from './hooks/useCardDesigns'
import {
  DEFAULT_TAXONOMY_SELECTIONS,
  DIMENSIONS,
  getVariationsForDimension,
} from '@/modules/taxonomy/catalog'
import {
  compileDesignRecipe,
  extractTaxonomySelections,
} from '@/modules/taxonomy/compiler'
import type {
  TaxonomyDimensionKey,
  TaxonomySelections,
} from '@/modules/taxonomy/types'
import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  getFlagshipDesignById,
  type PositionalInputs,
} from '@/modules/designs/flagshipDesigns'
import { RecipePickerPanel } from './RecipePickerPanel'
import { LayerEditorPanel } from './LayerEditorPanel'
import { PersonSelectorModal, type PersonProfile } from './PersonSelectorModal'
import { ReleaseModal } from './ReleaseModal'
import {
  Save,
  Undo2,
  Redo2,
  Rocket,
  AlertTriangle,
  User,
  FolderOpen,
  Sliders,
  Sparkles,
  Type,
  Square,
  ImageIcon,
  LayoutGrid,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react-native'

const INITIAL_FLAGSHIP_ID = 'classic-collector'
const INITIAL_INPUTS: PositionalInputs = {
  input1: 'MAYA ANGELOU',
  input2: 'POET & CIVIL RIGHTS ICON',
  input3: 'Phenomenal Woman, presidential poet, and civil rights champion whose literary voice moved generations.',
}
const INITIAL_FLAGSHIP_COMP = compileFlagshipDesign(INITIAL_FLAGSHIP_ID, INITIAL_INPUTS).composition

export function CardStudioScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ flagshipId?: string }>()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  // Auth / Current user
  const { username: currentUsername } = useStudioUser()

  // Designs query
  const designsQuery = useCardDesigns()
  const createDesignMutation = useCreateCardDesign()
  const updateDesignMutation = useUpdateCardDesign()

  // Active Design state
  const [activeDesign, setActiveDesign] = useState<CardDesign | null>(null)
  const [designTitle, setDesignTitle] = useState('Untitled Collectible')

  // Editor Mode: 'flagship' (default Canva-like flagship cards) | 'recipes' (5D taxonomy) | 'advanced' (layers)
  const [editorMode, setEditorMode] = useState<'flagship' | 'recipes' | 'advanced'>('flagship')

  // Flagship State
  const [activeFlagshipId, setActiveFlagshipId] = useState<string>(
    params.flagshipId || INITIAL_FLAGSHIP_ID,
  )
  const [positionalInputs, setPositionalInputs] = useState<PositionalInputs>(INITIAL_INPUTS)

  // Taxonomy Selections (5 dimensions)
  const [selections, setSelections] = useState<TaxonomySelections>(DEFAULT_TAXONOMY_SELECTIONS)

  // Composition & Local History (Undo/Redo)
  const [composition, setComposition] = useState<CardComposition>(INITIAL_FLAGSHIP_COMP)
  const [history, setHistory] = useState<CardComposition[]>([INITIAL_FLAGSHIP_COMP])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Active selected layer in advanced mode
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0)

  // Subject / Person
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null)
  const [personModalVisible, setPersonModalVisible] = useState(false)

  // Modals
  const [releaseModalVisible, setReleaseModalVisible] = useState(false)
  const [designsPickerVisible, setDesignsPickerVisible] = useState(false)

  // Conflict / Error state
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)

  // Active Flagship Design & Compilation info
  const activeFlagship = getFlagshipDesignById(activeFlagshipId) || FLAGSHIP_DESIGNS[0]
  const currentFlagshipResult = compileFlagshipDesign(
    activeFlagshipId,
    positionalInputs,
    selectedPerson,
  )

  // Handle route param updates if navigated from Gallery
  useEffect(() => {
    if (params.flagshipId && params.flagshipId !== activeFlagshipId) {
      setActiveFlagshipId(params.flagshipId)
      setEditorMode('flagship')
      const result = compileFlagshipDesign(params.flagshipId, positionalInputs, selectedPerson)
      setComposition(result.composition)
    }
  }, [params.flagshipId])

  // Push to history when composition changes
  const updateCompositionWithHistory = useCallback((nextComp: CardComposition) => {
    setComposition(nextComp)
    setHistory((prev) => {
      const slice = prev.slice(0, historyIndex + 1)
      return [...slice, nextComp]
    })
    setHistoryIndex((prev) => prev + 1)
    setSaveSuccessMsg(false)
  }, [historyIndex])

  function handleUndo() {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      const prevComp = history[nextIndex]
      setComposition(prevComp)

      // Restore mode-specific state
      if (prevComp.metadata?.flagship) {
        setActiveFlagshipId(prevComp.metadata.flagship.id)
        if (prevComp.metadata.flagship.inputs) {
          setPositionalInputs(prevComp.metadata.flagship.inputs)
        }
        setEditorMode('flagship')
      } else {
        const extracted = extractTaxonomySelections(prevComp)
        if (extracted) {
          setSelections(extracted)
          setEditorMode('recipes')
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
        if (nextComp.metadata.flagship.inputs) {
          setPositionalInputs(nextComp.metadata.flagship.inputs)
        }
        setEditorMode('flagship')
      } else {
        const extracted = extractTaxonomySelections(nextComp)
        if (extracted) {
          setSelections(extracted)
          setEditorMode('recipes')
        }
      }
    }
  }

  // --- Flagship Actions ---
  function handleSelectFlagshipDesign(designId: string) {
    setActiveFlagshipId(designId)
    // Preserve positional inputs across design switching!
    const result = compileFlagshipDesign(designId, positionalInputs, selectedPerson)
    updateCompositionWithHistory(result.composition)
  }

  function handleUpdatePositionalInput(field: string, value: string) {
    const nextInputs = { ...positionalInputs, [field]: value }
    setPositionalInputs(nextInputs)
    const result = compileFlagshipDesign(activeFlagshipId, nextInputs, selectedPerson)
    updateCompositionWithHistory(result.composition)
  }

  function handleAutofillFromPerson(p: PersonProfile) {
    const autofilled: PositionalInputs = {
      input1: p.displayName || '',
      input2: p.hometown || '',
      input3: p.bio || '',
    }
    setPositionalInputs(autofilled)
    const result = compileFlagshipDesign(activeFlagshipId, autofilled, p)
    updateCompositionWithHistory(result.composition)
  }

  // --- 5D Recipe Actions ---
  function handleSelectVariation(dimension: TaxonomyDimensionKey, variationKey: string) {
    const nextSelections: TaxonomySelections = {
      ...selections,
      [dimension]: { key: variationKey, version: 1 },
    }
    setSelections(nextSelections)
    const nextComp = compileDesignRecipe(nextSelections)
    updateCompositionWithHistory(nextComp)
  }

  function handleRandomizeRecipe() {
    const randomized: any = {}
    for (const dim of DIMENSIONS) {
      const variations = getVariationsForDimension(dim.key)
      if (variations.length > 0) {
        const randomIndex = Math.floor(Math.random() * variations.length)
        randomized[dim.key] = { key: variations[randomIndex].key, version: 1 }
      } else {
        randomized[dim.key] = selections[dim.key]
      }
    }
    const nextSelections = randomized as TaxonomySelections
    setSelections(nextSelections)
    const nextComp = compileDesignRecipe(nextSelections)
    updateCompositionWithHistory(nextComp)
  }

  // --- Design Load / Save ---
  function loadDesign(design: CardDesign) {
    setActiveDesign(design)
    setDesignTitle(design.title)
    setComposition(design.composition)
    setHistory([design.composition])
    setHistoryIndex(0)
    setSelectedLayerIndex(0)
    setConflictMessage(null)
    setDesignsPickerVisible(false)

    // Restore flagship state if present
    const compMetadata = (design.composition as CardComposition).metadata
    if (compMetadata?.flagship) {
      setActiveFlagshipId(compMetadata.flagship.id)
      if (compMetadata.flagship.inputs) {
        setPositionalInputs(compMetadata.flagship.inputs)
      }
      setEditorMode('flagship')
      return
    }

    // Restore taxonomy selections if available
    const extracted = extractTaxonomySelections(design.composition)
    if (extracted) {
      setSelections(extracted)
      setEditorMode('recipes')
    } else {
      setEditorMode('advanced')
    }
  }

  function startNewDesign() {
    setActiveDesign(null)
    setDesignTitle('New Collectible')
    setActiveFlagshipId(INITIAL_FLAGSHIP_ID)
    setPositionalInputs(INITIAL_INPUTS)
    const initialComp = compileFlagshipDesign(INITIAL_FLAGSHIP_ID, INITIAL_INPUTS).composition
    setComposition(initialComp)
    setHistory([initialComp])
    setHistoryIndex(0)
    setSelectedLayerIndex(0)
    setConflictMessage(null)
    setDesignsPickerVisible(false)
    setEditorMode('flagship')
  }

  async function handleSaveDesign() {
    setConflictMessage(null)
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

  // --- Advanced Layer editing callbacks ---
  const layers = composition.layers || []
  const activeLayer = layers[selectedLayerIndex]

  function handleUpdateActiveLayer(updatedLayer: CardCompositionLayer) {
    const nextLayers = [...layers]
    nextLayers[selectedLayerIndex] = updatedLayer
    updateCompositionWithHistory({ ...composition, layers: nextLayers })
  }

  function handleAddLayer(type: 'TEXT' | 'RECTANGLE' | 'IMAGE') {
    if (layers.length >= 100) return
    const id = `${type.toLowerCase()}_${Date.now().toString(36)}`
    let newLayer: CardCompositionLayer

    if (type === 'TEXT') {
      newLayer = {
        id,
        type: 'TEXT',
        x: 40,
        y: 400,
        width: 520,
        height: 60,
        text: 'New Text Layer',
        fontSize: 24,
        fill: '#FFFFFF',
      }
    } else if (type === 'RECTANGLE') {
      newLayer = {
        id,
        type: 'RECTANGLE',
        x: 40,
        y: 40,
        width: 520,
        height: 200,
        fill: '#3F3F46',
      }
    } else {
      newLayer = {
        id,
        type: 'IMAGE',
        x: 40,
        y: 80,
        width: 520,
        height: 500,
      }
    }

    const nextLayers = [...layers, newLayer]
    updateCompositionWithHistory({ ...composition, layers: nextLayers })
    setSelectedLayerIndex(nextLayers.length - 1)
  }

  function handleMoveLayer(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= layers.length) return
    const nextLayers = [...layers]
    const [moved] = nextLayers.splice(fromIndex, 1)
    nextLayers.splice(toIndex, 0, moved)
    updateCompositionWithHistory({ ...composition, layers: nextLayers })
    setSelectedLayerIndex(toIndex)
  }

  function handleDeleteLayer(index: number) {
    if (layers.length <= 1) return
    const nextLayers = layers.filter((_, i) => i !== index)
    updateCompositionWithHistory({ ...composition, layers: nextLayers })
    setSelectedLayerIndex(Math.max(0, index - 1))
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

        {/* Action buttons */}
        <View className="flex-row items-center gap-xs">
          <Button
            size="sm"
            variant="ghost"
            icon={FolderOpen}
            onPress={() => setDesignsPickerVisible(true)}
          >
            Designs
          </Button>
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
            size="sm"
            variant="primary"
            icon={Rocket}
            onPress={async () => {
              if (!activeDesign) {
                const created = await createDesignMutation.mutateAsync({
                  title: designTitle.trim() || 'Untitled Collectible',
                  composition,
                })
                setActiveDesign(created)
              }
              if (!selectedPerson) {
                setPersonModalVisible(true)
                return
              }
              setReleaseModalVisible(true)
            }}
          >
            Publish Release
          </Button>
        </View>
      </View>

      {/* Conflict / Warning Banner */}
      {conflictMessage && (
        <View className="mb-md flex-row items-center gap-sm rounded-xl border border-warning/40 bg-warning/10 p-md">
          <AlertTriangle size={20} className="text-warning flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-warning">{conflictMessage}</Text>
          </View>
        </View>
      )}

      {/* Subject Bar */}
      <View className="mb-md flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm">
        <View className="flex-row items-center gap-sm">
          <User size={18} className="text-brand" />
          <View>
            <Text className="text-xs uppercase text-muted-text">Card Subject</Text>
            <Text className="font-semibold text-text">
              {selectedPerson ? selectedPerson.displayName : 'No Subject Selected (Previewing Default)'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-xs">
          {selectedPerson && editorMode === 'flagship' && (
            <Button
              size="sm"
              variant="ghost"
              icon={RefreshCw}
              onPress={() => handleAutofillFromPerson(selectedPerson)}
            >
              Autofill Content
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onPress={() => setPersonModalVisible(true)}
          >
            {selectedPerson ? 'Change Subject' : 'Select Subject'}
          </Button>
        </View>
      </View>

      {/* Main Studio Work Area */}
      <View className={`gap-lg ${isDesktop ? 'flex-row items-start' : 'flex-col items-center'}`}>
        {/* Canvas Display Surface */}
        <View className="items-center justify-center p-sm">
          <CardCompositionRenderer
            composition={composition}
            person={selectedPerson}
            width={canvasWidth}
            isPreview={true}
          />
          <Text variant="caption" className="mt-sm text-center">
            Canvas {composition.canvas.width} × {composition.canvas.height} ({RDC_COMPOSITION_RENDERER_VERSION})
          </Text>

          {/* Mode Switcher Toggle: Flagship Designs (Default) | 5D Recipes | Advanced Layers */}
          <View className="mt-md flex-row items-center gap-xs rounded-xl border border-border bg-card-surface p-1">
            <Pressable
              testID="mode-flagship-button"
              onPress={() => setEditorMode('flagship')}
              className={`flex-row items-center gap-xs rounded-lg px-sm py-xs ${
                editorMode === 'flagship' ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <LayoutGrid size={15} color={editorMode === 'flagship' ? '#FFFFFF' : '#94A3B8'} />
              <Text
                className={`text-xs font-bold ${
                  editorMode === 'flagship' ? 'text-white' : 'text-muted-text'
                }`}
              >
                Flagship (20)
              </Text>
            </Pressable>

            <Pressable
              testID="mode-recipes-button"
              onPress={() => setEditorMode('recipes')}
              className={`flex-row items-center gap-xs rounded-lg px-sm py-xs ${
                editorMode === 'recipes' ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Sparkles size={15} color={editorMode === 'recipes' ? '#FFFFFF' : '#94A3B8'} />
              <Text
                className={`text-xs font-bold ${
                  editorMode === 'recipes' ? 'text-white' : 'text-muted-text'
                }`}
              >
                5D Recipes
              </Text>
            </Pressable>

            <Pressable
              testID="mode-advanced-button"
              onPress={() => setEditorMode('advanced')}
              className={`flex-row items-center gap-xs rounded-lg px-sm py-xs ${
                editorMode === 'advanced' ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Sliders size={15} color={editorMode === 'advanced' ? '#FFFFFF' : '#94A3B8'} />
              <Text
                className={`text-xs font-bold ${
                  editorMode === 'advanced' ? 'text-white' : 'text-muted-text'
                }`}
              >
                Layers
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Controls Column */}
        <View className={`gap-md ${isDesktop ? 'flex-1' : 'w-full'}`}>
          {/* Mode 1: 20 Flagship Designs & Positional Content Slots (Canva-like Simplicity) */}
          {editorMode === 'flagship' && (
            <View className="gap-md">
              {/* Flagship Selector Header */}
              <View className="rounded-2xl border border-border bg-surface p-md">
                <View className="flex-row items-center justify-between pb-xs">
                  <View>
                    <Text className="font-bold text-base text-text">Flagship Design Collection</Text>
                    <Text variant="caption">Pick one of 20 distinctive visual architectures</Text>
                  </View>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={ExternalLink}
                    onPress={() => router.push('/cards/gallery' as any)}
                  >
                    View Gallery
                  </Button>
                </View>

                {/* Horizontal Flagship Selector Carousel */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-xs pt-sm">
                  {FLAGSHIP_DESIGNS.map((d) => {
                    const isSelected = activeFlagshipId === d.id
                    return (
                      <Pressable
                        key={d.id}
                        testID={`flagship-design-card-${d.id}`}
                        onPress={() => handleSelectFlagshipDesign(d.id)}
                        className={`w-36 rounded-xl border p-sm ${
                          isSelected
                            ? 'border-brand bg-brand/10'
                            : 'border-border bg-card-surface hover:border-brand/40'
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            numberOfLines={1}
                            className={`font-bold text-xs ${
                              isSelected ? 'text-brand' : 'text-text'
                            }`}
                          >
                            {d.name}
                          </Text>
                          {isSelected && <Check size={14} className="text-brand" />}
                        </View>
                        <Text variant="caption" numberOfLines={1} className="mt-0.5 text-[10px]">
                          {d.family}
                        </Text>
                        <View
                          style={{ backgroundColor: d.palette.background }}
                          className="mt-xs h-3 w-full rounded-full border border-border"
                        />
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>

              {/* Positional Adaptive Content Slots Editor */}
              <View className="rounded-2xl border border-border bg-surface p-md gap-sm">
                <View className="flex-row items-center justify-between border-b border-border pb-xs">
                  <Text className="font-bold text-text">Adaptive Positional Content</Text>
                  <Text variant="caption">Auto-fits into {activeFlagship.name} slots</Text>
                </View>

                {/* Dynamically render all defined variable positional slots */}
                {activeFlagship.inputs.map((slotDef, sIdx) => {
                  const fittedSize = currentFlagshipResult.fittedFontSizes[slotDef.id]
                  const isOverflow = currentFlagshipResult.isOverflow[slotDef.id]
                  const val = positionalInputs[slotDef.id] ?? ''

                  return (
                    <View key={slotDef.id} className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-semibold text-text">
                          Slot {sIdx + 1} ({slotDef.label || slotDef.id})
                        </Text>
                        <View className="flex-row items-center gap-xs">
                          {isOverflow ? (
                            <Text className="text-[10px] font-bold text-warning">Overflow</Text>
                          ) : (
                            <Text className="text-[10px] font-semibold text-muted-text">
                              Fitted: {fittedSize}px
                            </Text>
                          )}
                        </View>
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
            </View>
          )}

          {/* Mode 2: 5D Recipe Studio (Style, Layout, Artwork, Content, Effects) */}
          {editorMode === 'recipes' && (
            <RecipePickerPanel
              selections={selections}
              onSelectVariation={handleSelectVariation}
              onRandomizeRecipe={handleRandomizeRecipe}
            />
          )}

          {/* Mode 3: Technical Layer Stack Editor (Advanced Power Mode) */}
          {editorMode === 'advanced' && (
            <View className="gap-md">
              <View className="rounded-2xl border border-border bg-surface p-md">
                <View className="flex-row items-center justify-between pb-xs">
                  <Text className="font-bold text-text">Layers ({layers.length}/100)</Text>
                  <Text variant="caption">Back to Front</Text>
                </View>
                <View className="flex-row gap-xs pt-xs">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Type}
                    disabled={layers.length >= 100}
                    onPress={() => handleAddLayer('TEXT')}
                  >
                    Add Text
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Square}
                    disabled={layers.length >= 100}
                    onPress={() => handleAddLayer('RECTANGLE')}
                  >
                    Add Shape
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={ImageIcon}
                    disabled={layers.length >= 100}
                    onPress={() => handleAddLayer('IMAGE')}
                  >
                    Add Image
                  </Button>
                </View>

                {/* Layer Stack Horizontal Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-xs pt-md">
                  {layers.map((layer, index) => {
                    const isSelected = index === selectedLayerIndex
                    return (
                      <Pressable
                        key={layer.id || index}
                        onPress={() => setSelectedLayerIndex(index)}
                        className={`rounded-lg border px-sm py-xs ${
                          isSelected ? 'border-brand bg-brand/10' : 'border-border bg-card-surface'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-brand' : 'text-muted-text'
                          }`}
                        >
                          #{index + 1} {layer.type}
                        </Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>

              {/* Active Layer Editor */}
              {activeLayer && (
                <LayerEditorPanel
                  layer={activeLayer}
                  layerIndex={selectedLayerIndex}
                  totalLayers={layers.length}
                  onChange={handleUpdateActiveLayer}
                  onMoveUp={() => handleMoveLayer(selectedLayerIndex, selectedLayerIndex + 1)}
                  onMoveDown={() => handleMoveLayer(selectedLayerIndex, selectedLayerIndex - 1)}
                  onDelete={() => handleDeleteLayer(selectedLayerIndex)}
                />
              )}
            </View>
          )}
        </View>
      </View>

      {/* Person Selection Modal */}
      <PersonSelectorModal
        visible={personModalVisible}
        selectedPersonId={selectedPerson?.id}
        onSelect={(p) => {
          setSelectedPerson(p)
          if (editorMode === 'flagship') {
            handleAutofillFromPerson(p)
          }
        }}
        onClose={() => setPersonModalVisible(false)}
      />

      {/* Release Modal */}
      {activeDesign && selectedPerson && (
        <ReleaseModal
          visible={releaseModalVisible}
          design={activeDesign}
          person={selectedPerson}
          currentUsername={currentUsername}
          onClose={() => setReleaseModalVisible(false)}
        />
      )}

      {/* Load / Designs Modal */}
      {designsPickerVisible && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/60 p-md">
          <View className="max-h-[80%] w-full max-w-lg rounded-3xl border border-border bg-surface p-lg">
            <View className="flex-row items-center justify-between pb-md">
              <Text className="text-xl font-bold">Reusable Card Designs</Text>
              <Button size="sm" variant="ghost" onPress={() => setDesignsPickerVisible(false)}>
                Close
              </Button>
            </View>

            <Button variant="primary" icon={Square} onPress={startNewDesign} className="mb-md">
              Create Blank Design
            </Button>

            <ScrollView className="max-h-80 gap-xs">
              {(designsQuery.data ?? []).map((design) => (
                <Pressable
                  key={design.id}
                  onPress={() => loadDesign(design)}
                  className="rounded-xl border border-border bg-card-surface p-md hover:border-brand"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-text">{design.title}</Text>
                    <Text variant="caption">v{design.revision}</Text>
                  </View>
                  <Text variant="caption">
                    {design.composition.layers.length} layers · Updated{' '}
                    {new Date(design.updatedAt).toLocaleDateString()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Screen>
  )
}
