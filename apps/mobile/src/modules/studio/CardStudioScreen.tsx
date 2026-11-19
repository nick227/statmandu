import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
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
} from 'lucide-react-native'

const INITIAL_TAXONOMY_SELECTIONS = DEFAULT_TAXONOMY_SELECTIONS
const INITIAL_COMPOSITION = compileDesignRecipe(INITIAL_TAXONOMY_SELECTIONS)

export function CardStudioScreen() {
  const router = useRouter()
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

  // Taxonomy Selections (5 dimensions)
  const [selections, setSelections] = useState<TaxonomySelections>(INITIAL_TAXONOMY_SELECTIONS)

  // Editor Mode: 'recipes' (default) | 'advanced'
  const [editorMode, setEditorMode] = useState<'recipes' | 'advanced'>('recipes')

  // Composition & Local History (Undo/Redo)
  const [composition, setComposition] = useState<CardComposition>(INITIAL_COMPOSITION)
  const [history, setHistory] = useState<CardComposition[]>([INITIAL_COMPOSITION])
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
      const extracted = extractTaxonomySelections(prevComp)
      if (extracted) {
        setSelections(extracted)
      }
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      const nextComp = history[nextIndex]
      setComposition(nextComp)
      const extracted = extractTaxonomySelections(nextComp)
      if (extracted) {
        setSelections(extracted)
      }
    }
  }

  // Handle changing a single dimension in the taxonomy recipe
  function handleSelectVariation(dimension: TaxonomyDimensionKey, variationKey: string) {
    const nextSelections: TaxonomySelections = {
      ...selections,
      [dimension]: { key: variationKey, version: 1 },
    }
    setSelections(nextSelections)
    const nextComp = compileDesignRecipe(nextSelections)
    updateCompositionWithHistory(nextComp)
  }

  // Surprise Me / Randomize Recipe
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

  // Load existing design
  function loadDesign(design: CardDesign) {
    setActiveDesign(design)
    setDesignTitle(design.title)
    setComposition(design.composition)
    setHistory([design.composition])
    setHistoryIndex(0)
    setSelectedLayerIndex(0)
    setConflictMessage(null)
    setDesignsPickerVisible(false)

    // Restore taxonomy selections if available
    const extracted = extractTaxonomySelections(design.composition)
    if (extracted) {
      setSelections(extracted)
      setEditorMode('recipes')
    } else {
      setEditorMode('advanced')
    }
  }

  // Start new design
  function startNewDesign() {
    setActiveDesign(null)
    setDesignTitle('New Collectible')
    setSelections(INITIAL_TAXONOMY_SELECTIONS)
    setComposition(INITIAL_COMPOSITION)
    setHistory([INITIAL_COMPOSITION])
    setHistoryIndex(0)
    setSelectedLayerIndex(0)
    setConflictMessage(null)
    setDesignsPickerVisible(false)
    setEditorMode('recipes')
  }

  // Save design (respects expectedRevision and handles 409 without discarding unsaved changes)
  async function handleSaveDesign() {
    setConflictMessage(null)
    try {
      if (!activeDesign) {
        // Create new design
        const created = await createDesignMutation.mutateAsync({
          title: designTitle.trim() || 'Untitled Collectible',
          composition,
        })
        setActiveDesign(created)
        setSaveSuccessMsg(true)
      } else {
        // Update existing design with expectedRevision
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

  // Layer editing callbacks (Advanced mode)
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
        {/* Title & Revision */}
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
                // Must save design first to establish immutable revision
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
              {selectedPerson ? selectedPerson.displayName : 'No Subject Selected (Previewing Mock)'}
            </Text>
          </View>
        </View>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setPersonModalVisible(true)}
        >
          {selectedPerson ? 'Change Subject' : 'Select Subject'}
        </Button>
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

          {/* Mode Switcher Toggle: Visual Recipe vs Advanced Layers */}
          <View className="mt-md flex-row items-center gap-xs rounded-xl border border-border bg-card-surface p-1">
            <Pressable
              testID="mode-recipes-button"
              onPress={() => setEditorMode('recipes')}
              className={`flex-row items-center gap-xs rounded-lg px-md py-xs ${
                editorMode === 'recipes' ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Sparkles size={16} color={editorMode === 'recipes' ? '#FFFFFF' : '#94A3B8'} />
              <Text
                className={`text-xs font-bold ${
                  editorMode === 'recipes' ? 'text-white' : 'text-muted-text'
                }`}
              >
                Visual Recipes
              </Text>
            </Pressable>

            <Pressable
              testID="mode-advanced-button"
              onPress={() => setEditorMode('advanced')}
              className={`flex-row items-center gap-xs rounded-lg px-md py-xs ${
                editorMode === 'advanced' ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Sliders size={16} color={editorMode === 'advanced' ? '#FFFFFF' : '#94A3B8'} />
              <Text
                className={`text-xs font-bold ${
                  editorMode === 'advanced' ? 'text-white' : 'text-muted-text'
                }`}
              >
                Advanced Layers
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Controls Column */}
        <View className={`gap-md ${isDesktop ? 'flex-1' : 'w-full'}`}>
          {editorMode === 'recipes' ? (
            /* Visual Recipe Selector (Default Primary Experience) */
            <RecipePickerPanel
              selections={selections}
              onSelectVariation={handleSelectVariation}
              onRandomizeRecipe={handleRandomizeRecipe}
            />
          ) : (
            /* Technical Layer Stack Editor (Advanced Power Mode) */
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
        onSelect={(p) => setSelectedPerson(p)}
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
