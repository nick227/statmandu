import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useStudioUser } from './hooks/useStudioUser'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
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
import { LayerEditorPanel } from './LayerEditorPanel'
import { PersonSelectorModal, type PersonProfile } from './PersonSelectorModal'
import { ReleaseModal } from './ReleaseModal'
import {
  Save,
  Undo2,
  Redo2,
  Plus,
  Type,
  Square,
  ImageIcon,
  Rocket,
  AlertTriangle,
  User,
  FolderOpen,
} from 'lucide-react-native'

const DEFAULT_COMPOSITION: CardComposition = {
  schemaVersion: 1,
  canvas: { width: 600, height: 900 },
  layers: [
    {
      id: 'bg-card',
      type: 'RECTANGLE',
      x: 0,
      y: 0,
      width: 600,
      height: 900,
      fill: '#18181B',
    },
    {
      id: 'frame-accent',
      type: 'RECTANGLE',
      x: 20,
      y: 20,
      width: 560,
      height: 860,
      fill: '#27272A',
    },
    {
      id: 'name-plate',
      type: 'TEXT',
      x: 40,
      y: 720,
      width: 520,
      height: 70,
      personField: 'displayName',
      fontSize: 34,
      fill: '#FFFFFF',
    },
    {
      id: 'bio-plate',
      type: 'TEXT',
      x: 40,
      y: 800,
      width: 520,
      height: 50,
      personField: 'bio',
      fontSize: 16,
      fill: '#94A3B8',
    },
  ],
}

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

  // Composition & Local History (Undo/Redo)
  const [composition, setComposition] = useState<CardComposition>(DEFAULT_COMPOSITION)
  const [history, setHistory] = useState<CardComposition[]>([DEFAULT_COMPOSITION])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Active selected layer
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

  // Push to history when composition changes via user edit
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
      setComposition(history[nextIndex])
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      setComposition(history[nextIndex])
    }
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
  }

  // Start new design
  function startNewDesign() {
    setActiveDesign(null)
    setDesignTitle('New Collectible')
    setComposition(DEFAULT_COMPOSITION)
    setHistory([DEFAULT_COMPOSITION])
    setHistoryIndex(0)
    setSelectedLayerIndex(0)
    setConflictMessage(null)
    setDesignsPickerVisible(false)
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

  // Layer editing callbacks
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
        </View>

        {/* Controls Column */}
        <View className={`gap-md ${isDesktop ? 'flex-1' : 'w-full'}`}>
          {/* Add Layer Toolbar */}
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

            <Button variant="primary" icon={Plus} onPress={startNewDesign} className="mb-md">
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
