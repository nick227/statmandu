import React, { useState, useMemo } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  type FlagshipDesign,
  type PositionalInputs,
} from './flagshipDesigns'
import {
  Check,
  Filter,
  Sparkles,
  Maximize2,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react-native'

const BENCHMARK_SUBJECT: PositionalInputs = {
  input1: 'MAYA ANGELOU',
  input2: 'POET & CIVIL RIGHTS ICON',
  input3: 'Phenomenal Woman, celebrated author, presidential poet, and civil rights champion whose literary voice moved generations.',
}

const DIVERSE_SUBJECTS: Record<string, PositionalInputs> = {
  'musician': {
    input1: 'MILES DAVIS',
    input2: 'MODAL JAZZ PIONEER',
    input3: 'Architect of Kind of Blue and Bitches Brew, redefining the landscape of modern improvisational music across six decades.',
  },
  'scientist': {
    input1: 'CHIE-SHIUNG WU',
    input2: 'EXPERIMENTAL PHYSICIST',
    input3: 'First lady of physics who disproved the law of conservation of parity through the landmark Wu experiment.',
  },
  'filmmaker': {
    input1: 'AGNES VARDA',
    input2: 'FRENCH NEW WAVE VISIONARY',
    input3: 'Pioneered feminist cinema and docufiction with Cleo from 5 to 7, Vagabond, and The Gleaners and I.',
  },
  'athlete': {
    input1: 'WILMA RUDOLPH',
    input2: 'OLYMPIC SPRINTING CHAMPION',
    input3: 'Overcame childhood polio to become the fastest woman in the world, winning three gold medals at the 1960 Rome Games.',
  },
}

export function FlagshipDesignGalleryScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  // Subject Mode: 'benchmark' (uniform comparison) | 'diverse' (profile variety)
  const [subjectMode, setSubjectMode] = useState<'benchmark' | 'diverse'>('benchmark')
  const [selectedFamily, setSelectedFamily] = useState<string>('ALL')

  // Detailed modal inspection
  const [inspectingDesign, setInspectingDesign] = useState<FlagshipDesign | null>(null)

  // Unique families for filtering
  const families = useMemo(() => {
    const list = ['ALL']
    FLAGSHIP_DESIGNS.forEach((d) => {
      if (!list.includes(d.family)) list.push(d.family)
    })
    return list
  }, [])

  // Filtered designs
  const filteredDesigns = useMemo(() => {
    if (selectedFamily === 'ALL') return FLAGSHIP_DESIGNS
    return FLAGSHIP_DESIGNS.filter((d) => d.family === selectedFamily)
  }, [selectedFamily])

  // Get inputs for a design
  function getInputsForDesign(design: FlagshipDesign, index: number): PositionalInputs {
    if (subjectMode === 'benchmark') {
      return BENCHMARK_SUBJECT
    }
    const diverseKeys = Object.keys(DIVERSE_SUBJECTS)
    const key = diverseKeys[index % diverseKeys.length]
    return DIVERSE_SUBJECTS[key]
  }

  return (
    <Screen title="Visual Quality Gate" withBack scroll>
      {/* Top Banner */}
      <View className="mb-lg rounded-2xl border border-border bg-card-surface p-lg">
        <View className="flex-row items-center gap-xs">
          <Sparkles size={20} className="text-brand" />
          <Text className="text-xs font-bold uppercase tracking-wider text-brand">
            Milestone 3 Quality Gate
          </Text>
        </View>
        <Text className="mt-1 font-bold text-2xl text-text">
          20 Flagship Collectible Designs
        </Text>
        <Text variant="caption" className="mt-xs text-sm text-muted-text">
          Evaluating true visual distinctiveness, adaptive typography fitting, framing, and layer balance.
        </Text>

        {/* Subject Mode Toggle */}
        <View className="mt-md flex-row flex-wrap items-center gap-sm pt-sm border-t border-border">
          <Text className="text-xs font-semibold text-text">Subject Data:</Text>
          <Pressable
            testID="subject-mode-benchmark"
            onPress={() => setSubjectMode('benchmark')}
            className={`rounded-lg px-md py-xs border ${
              subjectMode === 'benchmark' ? 'border-brand bg-brand/10' : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                subjectMode === 'benchmark' ? 'text-brand' : 'text-muted-text'
              }`}
            >
              Benchmark Subject (Direct Comparison)
            </Text>
          </Pressable>
          <Pressable
            testID="subject-mode-diverse"
            onPress={() => setSubjectMode('diverse')}
            className={`rounded-lg px-md py-xs border ${
              subjectMode === 'diverse' ? 'border-brand bg-brand/10' : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                subjectMode === 'diverse' ? 'text-brand' : 'text-muted-text'
              }`}
            >
              Diverse Creator Profiles
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Family Filter Chips */}
      <View className="mb-md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-xs">
          {families.map((fam) => {
            const isSelected = selectedFamily === fam
            return (
              <Pressable
                key={fam}
                testID={`filter-family-${fam}`}
                onPress={() => setSelectedFamily(fam)}
                className={`rounded-full border px-md py-xs ${
                  isSelected ? 'border-brand bg-brand/10' : 'border-border bg-card-surface'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-brand' : 'text-muted-text'
                  }`}
                >
                  {fam}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Grid of 20 Rendered Cards */}
      <View
        className={`gap-lg ${
          isDesktop ? 'flex-row flex-wrap justify-between' : 'flex-col items-center'
        }`}
      >
        {filteredDesigns.map((design, index) => {
          const inputs = getInputsForDesign(design, index)
          const result = compileFlagshipDesign(design.id, inputs)

          return (
            <View
              key={design.id}
              testID={`gallery-card-${design.id}`}
              className="mb-lg w-full max-w-[340px] rounded-3xl border border-border bg-card-surface p-md shadow-sm"
            >
              {/* Card Header & Metadata */}
              <View className="mb-sm flex-row items-center justify-between">
                <View className="flex-row items-center gap-xs">
                  <View className="rounded-md bg-brand/10 px-xs py-0.5">
                    <Text className="text-[10px] font-bold text-brand">#{index + 1}</Text>
                  </View>
                  <Text className="font-bold text-sm text-text">{design.name}</Text>
                </View>
                <Pressable
                  testID={`inspect-button-${design.id}`}
                  onPress={() => setInspectingDesign(design)}
                  className="rounded-full bg-surface p-1.5 border border-border"
                >
                  <Maximize2 size={14} color="#94A3B8" />
                </Pressable>
              </View>

              <Text variant="caption" numberOfLines={1} className="mb-sm text-[11px] text-muted-text">
                {design.visualTradition}
              </Text>

              {/* Rendered Live Card Surface */}
              <View className="items-center justify-center py-xs">
                <CardCompositionRenderer
                  composition={result.composition}
                  width={290}
                  isPreview={true}
                />
              </View>

              {/* Adaptive Typography Metrics Bar */}
              <View className="mt-md rounded-xl border border-border bg-surface p-xs">
                <View className="flex-row items-center justify-between px-xs py-0.5">
                  <Text className="text-[10px] text-muted-text">Slot 1 (Headline):</Text>
                  <Text className="text-[10px] font-bold text-text">
                    {result.fittedFontSizes.input1}px
                  </Text>
                </View>
                <View className="flex-row items-center justify-between px-xs py-0.5">
                  <Text className="text-[10px] text-muted-text">Slot 2 (Subhead):</Text>
                  <Text className="text-[10px] font-bold text-text">
                    {result.fittedFontSizes.input2}px
                  </Text>
                </View>
                <View className="flex-row items-center justify-between px-xs py-0.5">
                  <Text className="text-[10px] text-muted-text">Slot 3 (Details):</Text>
                  <Text className="text-[10px] font-bold text-text">
                    {result.fittedFontSizes.input3}px
                  </Text>
                </View>
              </View>

              {/* Edit in Studio action */}
              <Button
                size="sm"
                variant="ghost"
                className="mt-xs w-full"
                onPress={() => {
                  router.push({
                    pathname: '/cards/studio' as any,
                    params: { flagshipId: design.id },
                  })
                }}
              >
                Use this Design
              </Button>
            </View>
          )
        })}
      </View>

      {/* Inspect Modal */}
      {inspectingDesign && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/70 p-md">
          <View className="max-h-[90%] w-full max-w-md rounded-3xl border border-border bg-surface p-lg">
            <View className="flex-row items-center justify-between pb-sm">
              <View>
                <Text className="font-bold text-lg">{inspectingDesign.name}</Text>
                <Text variant="caption">{inspectingDesign.visualTradition}</Text>
              </View>
              <Pressable onPress={() => setInspectingDesign(null)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[70vh]">
              <View className="items-center justify-center py-md">
                <CardCompositionRenderer
                  composition={compileFlagshipDesign(inspectingDesign.id, BENCHMARK_SUBJECT).composition}
                  width={310}
                  isPreview={true}
                />
              </View>
              <Text className="mt-sm text-xs text-muted-text">
                {inspectingDesign.description}
              </Text>
            </ScrollView>

            <Button
              variant="primary"
              className="mt-md"
              onPress={() => {
                setInspectingDesign(null)
                router.push({
                  pathname: '/cards/studio' as any,
                  params: { flagshipId: inspectingDesign.id },
                })
              }}
            >
              Open in Card Studio
            </Button>
          </View>
        </View>
      )}
    </Screen>
  )
}
