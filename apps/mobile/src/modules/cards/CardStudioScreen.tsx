import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImagePlus, Layers, Shield, Sparkles, Star, UploadCloud } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import {
  ApiError,
  useCreateCard,
  useImages,
  usePlayers,
  usePublishCard,
  useUpdateCard,
  useUploadImage,
} from '@statman/sdk'
import { useRouter } from 'expo-router'
import { Screen } from '@/shared/layout/Screen'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Text } from '@/shared/ui/Text'
import { Textarea } from '@/shared/ui/Textarea'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'
import { useNativeColor, useStatusNativeColor } from '@/lib/theme'

type Player = components['schemas']['Player']
type ImageAsset = components['schemas']['ImageAsset']
type Card = components['schemas']['Card']
type CardType = components['schemas']['CardType']
type CardEditionMode = components['schemas']['CardEditionMode']

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'PROFILE', label: 'Profile' },
  { value: 'BIG_GAME', label: 'Big Game' },
  { value: 'MILESTONE', label: 'Milestone' },
  { value: 'SEASON', label: 'Season' },
  { value: 'HIGHLIGHT', label: 'Highlight' },
]

const STYLE_PRESETS = [
  { value: 'classic-foil', label: 'Classic Foil', primary: '#2563EB', secondary: '#E5E7EB', text: '#FFFFFF', plate: '#0F172A' },
  { value: 'team-pride', label: 'Team Pride', primary: '#16A34A', secondary: '#FACC15', text: '#FFFFFF', plate: '#052E16' },
  { value: 'action-chrome', label: 'Action Chrome', primary: '#DC2626', secondary: '#F8FAFC', text: '#FFFFFF', plate: '#111827' },
  { value: 'heritage-stock', label: 'Heritage Stock', primary: '#B45309', secondary: '#FEF3C7', text: '#1F2937', plate: '#FFFBEB' },
  { value: 'night-rivals', label: 'Night Rivals', primary: '#7C3AED', secondary: '#22D3EE', text: '#FFFFFF', plate: '#18181B' },
]

const CARD_FRAMES = [
  { value: 'team-badge', label: 'Team Badge', description: 'Crest, nameplate, team color bands' },
  { value: 'action-chrome', label: 'Action Chrome', description: 'Full-bleed action image with premium trim' },
  { value: 'stat-battle', label: 'Stat Battle', description: 'Ratings and matchup-style stat bars' },
  { value: 'heritage-back', label: 'Heritage Back', description: 'Classic card front with a rich stat back' },
]

function supportedContentType(value?: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (value === 'image/png' || value === 'image/webp') return value
  return 'image/jpeg'
}

function athleteName(player?: Player | null) {
  const profile = player?.athleteProfile
  return profile ? `${profile.firstName} ${profile.lastName}` : 'Select athlete'
}

function teamName(player?: Player | null) {
  return player?.currentTeam?.name ?? player?.sport?.name ?? 'Independent'
}

function teamInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SM'
}

function parseStatValue(stat: string) {
  const match = stat.match(/\d+/)
  return match ? Number(match[0]) : 0
}

function ratingFromStats(stats: string[]) {
  const total = stats.reduce((sum, stat) => sum + parseStatValue(stat), 0)
  return Math.max(68, Math.min(99, 72 + Math.round(total / 3)))
}

function apiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}

function mapRelease(release: 'draft' | 'unlimited' | 'limited' | 'one-of-one', editionSize: string) {
  if (release === 'limited') return { visibility: 'PUBLIC' as const, editionMode: 'LIMITED' as CardEditionMode, editionSize: Number(editionSize) || 100 }
  if (release === 'one-of-one') return { visibility: 'PUBLIC' as const, editionMode: 'ONE_OF_ONE' as CardEditionMode, editionSize: 1 }
  return { visibility: 'PUBLIC' as const, editionMode: 'UNLIMITED' as CardEditionMode, editionSize: null }
}

export function CardStudioScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWide = width >= 920
  const mutedColor = useNativeColor('mutedText')
  const brandColor = useNativeColor('brand')
  const verifiedColor = useStatusNativeColor('verified')

  const [athleteQuery, setAthleteQuery] = useState('')
  const playersQuery = usePlayers({ q: athleteQuery || undefined, limit: 20 })
  const players = useMemo(() => playersQuery.data?.pages.flatMap((page) => page.data) ?? [], [playersQuery.data])
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? players[0] ?? null
  const athleteProfileId = selectedPlayer?.athleteProfileId ?? ''

  const galleryQuery = useImages('ATHLETE_PROFILE', athleteProfileId, 'GALLERY')
  const gallery = galleryQuery.data?.data ?? []
  const uploadImage = useUploadImage()
  const createCard = useCreateCard()
  const publishCard = usePublishCard()

  const [savedCard, setSavedCard] = useState<Card | null>(null)
  const updateCard = useUpdateCard(savedCard?.id ?? '')
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null)
  const activeImage = selectedImage ?? gallery[0] ?? null
  const [title, setTitle] = useState('Rising Star')
  const [cardType, setCardType] = useState<CardType>('PROFILE')
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0].value)
  const [framePreset, setFramePreset] = useState(CARD_FRAMES[0].value)
  const [statOne, setStatOne] = useState('24 PTS')
  const [statTwo, setStatTwo] = useState('8 REB')
  const [statThree, setStatThree] = useState('5 AST')
  const [promptHelper, setPromptHelper] = useState('Confident, collectible athlete card using the selected action photo and a clean premium border.')
  const [backCopy, setBackCopy] = useState('A composed competitor with the tools to take over a game. Built from verified Statman profile data and reusable gallery media.')
  const [setName, setSetName] = useState('Statman Debut')
  const [cardNumber, setCardNumber] = useState('SM-001')
  const [release, setRelease] = useState<'draft' | 'unlimited' | 'limited' | 'one-of-one'>('draft')
  const [editionSize, setEditionSize] = useState('100')
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const selectedStyle = STYLE_PRESETS.find((style) => style.value === stylePreset) ?? STYLE_PRESETS[0]
  const selectedFrame = CARD_FRAMES.find((frame) => frame.value === framePreset) ?? CARD_FRAMES[0]
  const statTiles = [statOne, statTwo, statThree].filter(Boolean)
  const overallRating = ratingFromStats(statTiles)

  async function pickAndUploadPhoto() {
    if (!athleteProfileId) {
      Alert.alert('Select athlete', 'Choose an athlete before adding a gallery photo.')
      return
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Photo library access is needed to choose an image.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    if (!asset?.uri) return

    try {
      const uploaded = await uploadImage.mutateAsync({
        targetType: 'ATHLETE_PROFILE',
        targetId: athleteProfileId,
        usage: 'GALLERY',
        contentType: supportedContentType(asset.mimeType),
        file: {
          uri: asset.uri,
          name: asset.fileName ?? `card-gallery.${supportedContentType(asset.mimeType).split('/')[1]}`,
          type: supportedContentType(asset.mimeType),
        },
        originalFilename: asset.fileName ?? undefined,
        width: asset.width,
        height: asset.height,
      })
      setSelectedImage(uploaded.data as ImageAsset)
      setStatusMessage('Gallery photo saved.')
    } catch (error) {
      Alert.alert('Upload failed', apiErrorMessage(error))
    }
  }

  const statsSnapshotJson = useMemo(() => ({
    cardStudio: {
      framePreset,
      setName,
      cardNumber,
      backCopy,
      promptHelper,
      photoAssetId: activeImage?.id ?? null,
      stats: [statOne, statTwo, statThree].filter(Boolean),
    },
  }), [activeImage?.id, backCopy, cardNumber, framePreset, promptHelper, setName, statOne, statThree, statTwo])

  async function saveDraft() {
    if (!athleteProfileId) {
      Alert.alert('Select athlete', 'Choose an athlete before saving.')
      return null
    }
    try {
      const body = {
        athleteProfileId,
        title: title.trim() || 'Untitled Card',
        cardType,
        stylePreset,
        editionMode: release === 'one-of-one' ? 'ONE_OF_ONE' as const : release === 'limited' ? 'LIMITED' as const : 'UNLIMITED' as const,
        editionSize: release === 'limited' ? Number(editionSize) || 100 : release === 'one-of-one' ? 1 : null,
        sourceImageAssetId: activeImage?.id ?? null,
        statsSnapshotJson,
      }
      const response = savedCard
        ? await updateCard.mutateAsync(body)
        : await createCard.mutateAsync(body)
      setSavedCard(response.data)
      setStatusMessage('Draft saved.')
      return response.data
    } catch (error) {
      Alert.alert('Save failed', apiErrorMessage(error))
      return null
    }
  }

  async function publishCurrentCard() {
    const card = savedCard ?? await saveDraft()
    if (!card) return
    try {
      const response = await publishCard.mutateAsync({
        cardId: card.id,
        body: mapRelease(release === 'draft' ? 'unlimited' : release, editionSize),
      })
      setSavedCard(response.data)
      setStatusMessage('Card published.')
    } catch (error) {
      Alert.alert('Publish failed', apiErrorMessage(error))
    }
  }

  const isBusy = uploadImage.isPending || createCard.isPending || updateCard.isPending || publishCard.isPending
  const previewFirst = !isWide

  const preview = (
    <View
      className={cn('gap-md', isWide ? 'w-[390px]' : 'w-full')}
      style={Platform.OS === 'web' && isWide ? ({ position: 'sticky', top: 24 } as any) : undefined}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text variant="statLabel">Live Preview</Text>
          <Text className="text-lg font-semibold text-text">{side === 'front' ? 'Front' : 'Back'}</Text>
        </View>
        <View className="flex-row rounded-md border border-border bg-surface p-1">
          {(['front', 'back'] as const).map((value) => (
            <Pressable key={value} onPress={() => setSide(value)} className={cn('rounded px-md py-xs', side === value && 'bg-brand')}>
              <Text className={cn('font-semibold capitalize', side === value ? 'text-white' : 'text-muted-text')}>{value}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="overflow-hidden rounded-lg border border-border bg-black" style={{ aspectRatio: 0.72 }}>
        {activeImage?.url ? (
          <SmartImage uri={activeImage.url} className="absolute inset-0 h-full w-full" resizeMode="cover" />
        ) : (
          <View className="absolute inset-0 items-center justify-center bg-muted-text/15">
            <ImagePlus size={42} color={mutedColor} />
          </View>
        )}
        <View className="absolute inset-0 bg-black/35" />
        <View className={cn('absolute inset-x-0 top-0 h-2', STYLE_PRESETS.find((style) => style.value === stylePreset)?.accent ?? 'bg-brand')} />
        {side === 'front' ? (
          <View className="flex-1 justify-between p-lg">
            <View className="flex-row items-start justify-between">
              <Badge tone="brand">{CARD_TYPES.find((type) => type.value === cardType)?.label ?? 'Card'}</Badge>
              <Badge tone="verified">{release === 'one-of-one' ? '1-of-1' : release === 'limited' ? `${editionSize} max` : release === 'draft' ? 'Draft' : 'Unlimited'}</Badge>
            </View>
            <View className="gap-md">
              <View>
                <Text className="text-3xl font-bold text-white" numberOfLines={1}>{athleteName(selectedPlayer)}</Text>
                <Text className="text-white/70" numberOfLines={1}>{title}</Text>
              </View>
              <View className="flex-row gap-sm">
                {[statOne, statTwo, statThree].filter(Boolean).map((stat) => (
                  <View key={stat} className="min-w-20 rounded-md bg-white/15 px-sm py-xs">
                    <Text className="text-white font-semibold text-center">{stat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-between bg-black/75 p-lg">
            <View className="gap-sm">
              <Text className="text-2xl font-bold text-white">{title}</Text>
              <Text className="text-white/70">{promptHelper}</Text>
            </View>
            <View className="gap-sm">
              <View className="h-px bg-white/15" />
              <Text variant="caption" className="text-white/60">Edition</Text>
              <Text className="text-white font-semibold">
                {release === 'limited' ? `Limited to ${editionSize}` : release === 'one-of-one' ? 'One issued copy' : release === 'draft' ? 'Private draft' : 'Unlimited public claims'}
              </Text>
              <Text variant="caption" className="text-white/50" numberOfLines={1}>
                {savedCard?.originHash ? `Origin ${savedCard.originHash}` : 'Origin hash is assigned at publish.'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Card className="p-md gap-sm">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-text">Edition Preview</Text>
          <Badge tone={savedCard?.status === 'PUBLISHED' ? 'verified' : 'muted-text'}>{savedCard?.status ?? 'Unsaved'}</Badge>
        </View>
        <Text variant="caption">
          {release === 'limited' ? `${editionSize} total copies` : release === 'one-of-one' ? '1 total copy' : release === 'draft' ? 'Private until published' : 'Unlimited claims'}
        </Text>
        {statusMessage ? <Text variant="caption" className="text-verified">{statusMessage}</Text> : null}
        <View className="flex-row gap-sm pt-xs">
          <Button className="flex-1" variant="secondary" isLoading={createCard.isPending || updateCard.isPending} onPress={saveDraft}>
            Save Draft
          </Button>
          <Button className="flex-1" isLoading={publishCard.isPending} disabled={release === 'draft'} onPress={publishCurrentCard}>
            Publish
          </Button>
        </View>
        {savedCard ? (
          <Button variant="ghost" onPress={() => router.push({ pathname: '/cards/[cardId]', params: { cardId: savedCard.id } })}>
            View Card
          </Button>
        ) : null}
      </Card>
    </View>
  )

  const controls = (
    <View className={cn('gap-md', isWide ? 'flex-1' : 'w-full')}>
      <Card className="p-md gap-sm">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-text">Athlete</Text>
          {playersQuery.isFetching ? <ActivityIndicator size="small" color={brandColor} /> : null}
        </View>
        <Input value={athleteQuery} onChangeText={setAthleteQuery} placeholder="Search athletes" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {players.map((player) => {
            const selected = player.id === selectedPlayer?.id
            return (
              <Pressable
                key={player.id}
                onPress={() => {
                  setSelectedPlayerId(player.id)
                  setSelectedImage(null)
                }}
                className={cn('min-w-44 rounded-md border p-sm', selected ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}
              >
                <Text className={cn('font-semibold', selected ? 'text-brand' : 'text-text')}>{athleteName(player)}</Text>
                <Text variant="caption" numberOfLines={1}>{player.currentTeam?.name ?? player.sport?.name ?? 'Athlete profile'}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </Card>

      <Card className="p-md gap-sm">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-text">Gallery Photo</Text>
          <Button size="sm" variant="secondary" isLoading={uploadImage.isPending} onPress={pickAndUploadPhoto}>Upload</Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          <Pressable onPress={pickAndUploadPhoto} className="h-24 w-24 items-center justify-center rounded-md border border-dashed border-border bg-canvas">
            <UploadCloud size={24} color={mutedColor} />
          </Pressable>
          {gallery.map((image) => {
            const selected = image.id === activeImage?.id
            return (
              <Pressable key={image.id} onPress={() => setSelectedImage(image)} className={cn('h-24 w-24 overflow-hidden rounded-md border', selected ? 'border-brand' : 'border-border')}>
                <Image source={{ uri: image.url }} className="h-full w-full" resizeMode="cover" />
              </Pressable>
            )
          })}
        </ScrollView>
      </Card>

      <Card className="p-md gap-sm">
        <Text className="font-semibold text-text">Layout & Style</Text>
        <View className="flex-row flex-wrap gap-sm">
          {LAYOUTS.map((layout) => (
            <Pressable key={layout.value} onPress={() => setLayoutPreset(layout.value)} className={cn('rounded-md border px-md py-sm', layoutPreset === layout.value ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}>
              <Text className={cn('font-semibold', layoutPreset === layout.value ? 'text-brand' : 'text-text')}>{layout.label}</Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-row flex-wrap gap-sm">
          {STYLE_PRESETS.map((style) => (
            <Pressable key={style.value} onPress={() => setStylePreset(style.value)} className={cn('w-36 rounded-md border p-sm', stylePreset === style.value ? `${style.border} bg-surface` : 'border-border bg-canvas')}>
              <View className={cn('mb-sm h-2 rounded-full', style.accent)} />
              <Text className="font-semibold text-text">{style.label}</Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-row flex-wrap gap-sm pt-xs">
          {CARD_TYPES.map((type) => (
            <Pressable key={type.value} onPress={() => setCardType(type.value)} className={cn('rounded-md border px-md py-sm', cardType === type.value ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}>
              <Text className={cn('font-semibold', cardType === type.value ? 'text-brand' : 'text-text')}>{type.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card className="p-md gap-sm">
        <Text className="font-semibold text-text">Stats</Text>
        <View className="flex-row gap-sm">
          <Input className="flex-1" value={statOne} onChangeText={setStatOne} placeholder="24 PTS" />
          <Input className="flex-1" value={statTwo} onChangeText={setStatTwo} placeholder="8 REB" />
          <Input className="flex-1" value={statThree} onChangeText={setStatThree} placeholder="5 AST" />
        </View>
      </Card>

      <Card className="p-md gap-sm">
        <View className="flex-row items-center gap-xs">
          <Sparkles size={16} color={verifiedColor} />
          <Text className="font-semibold text-text">AI Prompt Helper</Text>
        </View>
        <Input value={title} onChangeText={setTitle} placeholder="Card title" />
        <Textarea value={promptHelper} onChangeText={setPromptHelper} placeholder="Prompt direction for future generation" />
      </Card>

      <Card className="p-md gap-sm">
        <View className="flex-row items-center gap-xs">
          <Layers size={16} color={brandColor} />
          <Text className="font-semibold text-text">Release Settings</Text>
        </View>
        <View className="flex-row flex-wrap gap-sm">
          {[
            ['draft', 'Private Draft'],
            ['unlimited', 'Public Unlimited'],
            ['limited', 'Limited'],
            ['one-of-one', '1-of-1'],
          ].map(([value, label]) => (
            <Pressable key={value} onPress={() => setRelease(value as any)} className={cn('rounded-md border px-md py-sm', release === value ? 'border-brand bg-brand/10' : 'border-border bg-canvas')}>
              <Text className={cn('font-semibold', release === value ? 'text-brand' : 'text-text')}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {release === 'limited' ? (
          <Input value={editionSize} onChangeText={setEditionSize} keyboardType="number-pad" placeholder="Edition size" />
        ) : null}
      </Card>
    </View>
  )

  return (
    <Screen title="Card Studio" scroll contentClassName="px-lg gap-lg">
      {previewFirst ? preview : null}
      <View className={cn('gap-lg', isWide && 'flex-row items-start')}>
        {controls}
        {isWide ? preview : null}
      </View>
      {isBusy ? (
        <View className="fixed bottom-lg right-lg rounded-full bg-surface px-md py-sm">
          <Text variant="caption">Working...</Text>
        </View>
      ) : null}
    </Screen>
  )
}
