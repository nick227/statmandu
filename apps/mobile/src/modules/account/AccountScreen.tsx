import { useState, useEffect } from 'react'
import { Platform, Pressable, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useAccountProfileMutations } from '@/modules/account/useAccountProfileMutations'
import {
  Plus,
  Trash2,
  LogOut,
  Check,
  User,
  Camera,
  Palette,
  Trophy,
  BookOpen,
  Music,
  Film,
  Zap,
} from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { LoadingState } from '@/shared/ui/LoadingState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Screen } from '@/shared/layout/Screen'
import { useAccountSession } from '@/modules/account/useAccountSession'
import { AccountMediaGrid } from '@/modules/account/AccountMediaGrid'
import { clearStoredToken } from '@/lib/sdk'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'

export type PursuitFocus =
  | 'CREATOR'
  | 'ATHLETE'
  | 'WRITER'
  | 'MUSICIAN'
  | 'PERFORMER'
  | 'CUSTOM'

interface CustomField {
  id: string
  label: string
  value: string
}

const PURSUIT_CHIPS: Array<{
  id: PursuitFocus
  label: string
  icon: any
}> = [
  { id: 'CREATOR', label: 'Creator', icon: Palette },
  { id: 'ATHLETE', label: 'Athlete', icon: Trophy },
  { id: 'WRITER', label: 'Writer', icon: BookOpen },
  { id: 'MUSICIAN', label: 'Musician', icon: Music },
  { id: 'PERFORMER', label: 'Performer', icon: Film },
  { id: 'CUSTOM', label: 'Custom', icon: Zap },
]

export function AccountScreen() {
  const router = useRouter()
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  const { isError, isLoading, logout, user, capabilities } = useAccountSession()
  const { updateProfile, uploadImage } = useAccountProfileMutations()

  // Active Chip (Creator is our Primary tab)
  const [pursuit, setPursuit] = useState<PursuitFocus>('CREATOR')

  const initialPerson = capabilities?.personProfile as any

  // Avatar Image URI state (clickable to upload new main avatar)
  const [avatarUri, setAvatarUri] = useState<string | null>(initialPerson?.avatarUrl ?? user?.profile?.avatarUrl ?? null)

  // Primary Creator Fields
  const [displayName, setDisplayName] = useState(initialPerson?.displayName ?? user?.profile?.displayName ?? '')
  const [location, setLocation] = useState(initialPerson?.hometown ?? (user?.profile as any)?.hometown ?? '')
  const [age, setAge] = useState(initialPerson?.age ?? '')
  const [calling, setCalling] = useState(initialPerson?.calling ?? '')
  const [bio, setBio] = useState(initialPerson?.bio ?? user?.profile?.bio ?? '')
  const [quote, setQuote] = useState(initialPerson?.quote ?? '')
  const [debut, setDebut] = useState(initialPerson?.debut ?? '')

  // Discipline specific fields (starts clean with no mock data)
  const [athleteSport, setAthleteSport] = useState('')
  const [athleteRole, setAthleteRole] = useState('')
  const [athleteStat, setAthleteStat] = useState('')
  const [athleteAccolades, setAthleteAccolades] = useState('')

  const [writerFocus, setWriterFocus] = useState('')
  const [writerWorks, setWriterWorks] = useState('')
  const [writerEra, setWriterEra] = useState('')
  const [writerHonors, setWriterHonors] = useState('')

  const [musicianGenre, setMusicianGenre] = useState('')
  const [musicianInstruments, setMusicianInstruments] = useState('')
  const [musicianReleases, setMusicianReleases] = useState('')
  const [musicianCollabs, setMusicianCollabs] = useState('')

  const [performerMedium, setPerformerMedium] = useState('')
  const [performerRole, setPerformerRole] = useState('')
  const [performerProductions, setPerformerProductions] = useState('')
  const [performerHonors, setPerformerHonors] = useState('')

  const [customCalling, setCustomCalling] = useState('')
  const [customInnovation, setCustomInnovation] = useState('')
  const [customMilestone, setCustomMilestone] = useState('')
  const [customPhilosophy, setCustomPhilosophy] = useState('')

  // Dynamic Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>(initialPerson?.customFields ?? [])

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sync state whenever capabilities or user profile updates
  useEffect(() => {
    const p = capabilities?.personProfile as any
    if (p) {
      if (p.displayName !== undefined) setDisplayName(p.displayName || '')
      if (p.hometown !== undefined) setLocation(p.hometown || '')
      if (p.calling !== undefined) setCalling(p.calling || '')
      if (p.age !== undefined) setAge(p.age || '')
      if (p.bio !== undefined) setBio(p.bio || '')
      if (p.quote !== undefined) setQuote(p.quote || '')
      if (p.debut !== undefined) setDebut(p.debut || '')
      if (p.avatarUrl !== undefined) setAvatarUri(p.avatarUrl || null)
      if (Array.isArray(p.customFields)) {
        setCustomFields(p.customFields)
      }
      if (Array.isArray(p.specializations)) {
        for (const spec of p.specializations) {
          if (spec.type === 'ATHLETE' && spec.attributes) {
            if (spec.attributes.sport !== undefined) setAthleteSport(spec.attributes.sport)
            if (spec.attributes.role !== undefined) setAthleteRole(spec.attributes.role)
            if (spec.attributes.stat !== undefined) setAthleteStat(spec.attributes.stat)
            if (spec.attributes.accolades !== undefined) setAthleteAccolades(spec.attributes.accolades)
          } else if (spec.type === 'WRITER' && spec.attributes) {
            if (spec.attributes.focus !== undefined) setWriterFocus(spec.attributes.focus)
            if (spec.attributes.works !== undefined) setWriterWorks(spec.attributes.works)
            if (spec.attributes.era !== undefined) setWriterEra(spec.attributes.era)
            if (spec.attributes.honors !== undefined) setWriterHonors(spec.attributes.honors)
          } else if (spec.type === 'MUSICIAN' && spec.attributes) {
            if (spec.attributes.genre !== undefined) setMusicianGenre(spec.attributes.genre)
            if (spec.attributes.instruments !== undefined) setMusicianInstruments(spec.attributes.instruments)
            if (spec.attributes.releases !== undefined) setMusicianReleases(spec.attributes.releases)
            if (spec.attributes.collabs !== undefined) setMusicianCollabs(spec.attributes.collabs)
          } else if (spec.type === 'PERFORMER' && spec.attributes) {
            if (spec.attributes.medium !== undefined) setPerformerMedium(spec.attributes.medium)
            if (spec.attributes.role !== undefined) setPerformerRole(spec.attributes.role)
            if (spec.attributes.productions !== undefined) setPerformerProductions(spec.attributes.productions)
            if (spec.attributes.honors !== undefined) setPerformerHonors(spec.attributes.honors)
          } else if (spec.type === 'CUSTOM' && spec.attributes) {
            if (spec.attributes.calling !== undefined) setCustomCalling(spec.attributes.calling)
            if (spec.attributes.innovation !== undefined) setCustomInnovation(spec.attributes.innovation)
            if (spec.attributes.milestone !== undefined) setCustomMilestone(spec.attributes.milestone)
            if (spec.attributes.philosophy !== undefined) setCustomPhilosophy(spec.attributes.philosophy)
          }
        }
      }
    } else if (user?.profile) {
      if (user.profile.displayName) setDisplayName(user.profile.displayName)
      if (user.profile.bio) setBio(user.profile.bio)
      if (user.profile.avatarUrl) setAvatarUri(user.profile.avatarUrl)
      if ((user.profile as any).hometown) setLocation((user.profile as any).hometown)
    }
  }, [capabilities?.personProfile, user?.profile])

  if (isLoading) {
    return (
      <Screen insetTop={false}>
        <LoadingState />
      </Screen>
    )
  }

  if (isError || !user) {
    return (
      <Screen title="Profile" insetTop={false}>
        <View className="w-full max-w-xl mx-auto py-16 px-4">
          <SignInPrompt message="Sign in to customize your personal card attributes." />
        </View>
      </Screen>
    )
  }

  const headerDisplayName = displayName || user.profile?.displayName || user.profile?.username || user.email || 'Collector'
  const username = user.profile?.username ?? user.email?.split('@')[0] ?? 'collector'
  const athleteProfileId = capabilities?.personProfile?.id ?? capabilities?.athleteProfiles?.[0]?.athleteProfileId ?? user.profile?.id ?? null

  async function handlePickAvatar() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      })

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const asset = result.assets[0]
        setAvatarUri(asset.uri)
        if (athleteProfileId) {
          const contentType = asset.mimeType === 'image/png' || asset.mimeType === 'image/webp' ? asset.mimeType : 'image/jpeg'
          const res = await uploadImage.mutateAsync({
            targetType: 'ATHLETE_PROFILE',
            targetId: athleteProfileId,
            usage: 'AVATAR',
            contentType,
            file: {
              uri: asset.uri,
              name: asset.fileName || `avatar.${contentType.split('/')[1]}`,
              type: contentType,
            },
            originalFilename: asset.fileName ?? undefined,
            width: asset.width,
            height: asset.height,
          })
          if (res?.data?.url) {
            setAvatarUri(res.data.url)
            await updateProfile.mutateAsync({ avatarUrl: res.data.url })
          }
        }
      }
    } catch (e) {
      console.warn('Failed to pick avatar:', e)
    }
  }

  function handleAddCustomField() {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      label: 'New Field',
      value: '',
    }
    setCustomFields([...customFields, newField])
  }

  function handleUpdateCustomField(id: string, key: 'label' | 'value', text: string) {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, [key]: text } : f))
    )
  }

  function handleRemoveCustomField(id: string) {
    setCustomFields(customFields.filter((f) => f.id !== id))
  }

  async function handleSaveProfile() {
    setSaveError(null)
    try {
      const specializations = [
        (athleteSport || athleteRole || athleteStat || athleteAccolades) ? {
          type: 'ATHLETE',
          attributes: { sport: athleteSport, role: athleteRole, stat: athleteStat, accolades: athleteAccolades }
        } : null,
        (writerFocus || writerWorks || writerEra || writerHonors) ? {
          type: 'WRITER',
          attributes: { focus: writerFocus, works: writerWorks, era: writerEra, honors: writerHonors }
        } : null,
        (musicianGenre || musicianInstruments || musicianReleases || musicianCollabs) ? {
          type: 'MUSICIAN',
          attributes: { genre: musicianGenre, instruments: musicianInstruments, releases: musicianReleases, collabs: musicianCollabs }
        } : null,
        (performerMedium || performerRole || performerProductions || performerHonors) ? {
          type: 'PERFORMER',
          attributes: { medium: performerMedium, role: performerRole, productions: performerProductions, honors: performerHonors }
        } : null,
        (customCalling || customInnovation || customMilestone || customPhilosophy) ? {
          type: 'CUSTOM',
          attributes: { calling: customCalling, innovation: customInnovation, milestone: customMilestone, philosophy: customPhilosophy }
        } : null,
      ].filter(Boolean)

      await updateProfile.mutateAsync({
        displayName,
        hometown: location,
        calling,
        age,
        bio,
        quote,
        debut,
        avatarUrl: avatarUri ?? undefined,
        specializations,
        customFields,
      })

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save profile. Please try again.')
    }
  }

  return (
    <Screen title="Profile" insetTop={false} scroll>
      <View className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 gap-8 md:gap-10 pb-28">
        {/* 1. Identity Header */}
        <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 shadow-xs flex-row flex-wrap items-center justify-between gap-6">
          <View className="flex-row items-center gap-4 flex-1 min-w-[240px]">
            {/* Clickable Avatar to Upload Main Photo */}
            <Pressable
              testID="avatar-upload-button"
              onPress={handlePickAvatar}
              className="relative cursor-pointer active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel="Upload avatar"
            >
              <Avatar
                uri={avatarUri ?? user.profile?.avatarUrl}
                fallback={headerDisplayName}
                size="lg"
                className="border-2 border-border shadow-xs"
              />
              <View className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand items-center justify-center border-2 border-surface shadow-xs">
                <Camera size={12} color="#ffffff" />
              </View>
            </Pressable>

            <View className="gap-0.5 min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-extrabold tracking-tight text-text" numberOfLines={1}>
                  {headerDisplayName}
                </Text>
                <Badge tone="verified">Creator</Badge>
              </View>
              <Text variant="caption" className="text-sm font-semibold text-muted-text">
                @{username} · {user.email}
              </Text>
            </View>
          </View>

          <Button
            variant="ghost"
            size="sm"
            icon={LogOut}
            isLoading={logout.isPending}
            onPress={async () => {
              await logout.mutateAsync()
              await clearStoredToken()
              router.replace('/login')
            }}
          >
            Log out
          </Button>
        </View>

        {/* 2. Main Two-Column Layout: Details on Left, Media on Right */}
        <View className="flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Form Details */}
          <View className="w-full lg:w-1/2 gap-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold tracking-tight text-text">
                Details
              </Text>
            </View>

            {/* Chips: Creator is Primary */}
            <View className="flex-row flex-wrap gap-2">
              {PURSUIT_CHIPS.map((chip) => {
                const active = pursuit === chip.id
                const Icon = chip.icon
                return (
                  <Pressable
                    key={chip.id}
                    testID={`chip-${chip.id.toLowerCase()}`}
                    onPress={() => setPursuit(chip.id)}
                    className={cn(
                      'flex-row items-center gap-2 rounded-xl border px-3.5 py-2.5 active:opacity-70 transition-all',
                      active
                        ? 'border-brand bg-brand/10 shadow-xs'
                        : 'border-border/80 bg-surface hover:border-brand/40'
                    )}
                  >
                    <Icon size={15} color={active ? brandColor : mutedColor} />
                    <Text className={cn('text-sm font-semibold', active ? 'text-brand' : 'text-text')}>
                      {chip.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* ─── PRIMARY CREATOR TAB ─── */}
            {pursuit === 'CREATOR' && (
              <>
                {/* Identity Card */}
                <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                  <View className="flex-row items-center gap-2 border-b border-border/40 pb-2.5">
                    <User size={18} className="text-brand" />
                    <Text className="font-bold text-base text-text">
                      Identity
                    </Text>
                  </View>

                  <View className="gap-4">
                    <FormField
                      testID="field-name"
                      label="Name"
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="e.g. Alex Chen"
                    />

                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <FormField
                          testID="field-location"
                          label="Location"
                          value={location}
                          onChangeText={setLocation}
                          placeholder="e.g. San Francisco, CA"
                        />
                      </View>
                      <View className="w-28">
                        <FormField
                          testID="field-age"
                          label="Age"
                          value={age}
                          onChangeText={setAge}
                          placeholder="e.g. 28"
                        />
                      </View>
                    </View>

                    <FormField
                      testID="field-calling"
                      label="Calling"
                      value={calling}
                      onChangeText={setCalling}
                      placeholder="e.g. Designer, Software Engineer, Athlete"
                    />
                  </View>
                </View>

                {/* Bio Card (Lives ONLY on Primary Creator Tab, NOT persistent across other chips) */}
                <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                  <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
                    Bio
                  </Text>

                  <View className="gap-4">
                    <FormField
                      testID="field-bio"
                      label="Bio"
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Tell your story, achievements, or collecting focus..."
                      multiline
                      numberOfLines={3}
                    />

                    <FormField
                      testID="field-quote"
                      label="Quote"
                      value={quote}
                      onChangeText={setQuote}
                      placeholder="A personal motto featured on card backs"
                    />

                    <FormField
                      testID="field-debut"
                      label="Debut"
                      value={debut}
                      onChangeText={setDebut}
                      placeholder="e.g. 2026"
                    />
                  </View>
                </View>
              </>
            )}

            {/* ─── ATHLETE TAB ─── */}
            {pursuit === 'ATHLETE' && (
              <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
                  Athlete
                </Text>
                <View className="gap-4">
                  <FormField
                    testID="field-sport"
                    label="Sport"
                    value={athleteSport}
                    onChangeText={setAthleteSport}
                    placeholder="e.g. Basketball, Track"
                  />
                  <FormField
                    testID="field-role"
                    label="Role"
                    value={athleteRole}
                    onChangeText={setAthleteRole}
                    placeholder="e.g. Point Guard, Sprinter"
                  />
                  <FormField
                    testID="field-statistic"
                    label="Statistic"
                    value={athleteStat}
                    onChangeText={setAthleteStat}
                    placeholder="e.g. Career record or scoring average"
                  />
                  <FormField
                    testID="field-accolades"
                    label="Accolades"
                    value={athleteAccolades}
                    onChangeText={setAthleteAccolades}
                    placeholder="e.g. Championship titles, MVP"
                  />
                </View>
              </View>
            )}

            {/* ─── WRITER TAB ─── */}
            {pursuit === 'WRITER' && (
              <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
                  Writer
                </Text>
                <View className="gap-4">
                  <FormField
                    testID="field-focus"
                    label="Focus"
                    value={writerFocus}
                    onChangeText={setWriterFocus}
                    placeholder="e.g. Poetry, Fiction, Essays"
                  />
                  <FormField
                    testID="field-works"
                    label="Works"
                    value={writerWorks}
                    onChangeText={setWriterWorks}
                    placeholder="e.g. Flagship publication or monograph"
                  />
                  <FormField
                    testID="field-era"
                    label="Era"
                    value={writerEra}
                    onChangeText={setWriterEra}
                    placeholder="e.g. Contemporary Literature"
                  />
                  <FormField
                    testID="field-honors"
                    label="Honors"
                    value={writerHonors}
                    onChangeText={setWriterHonors}
                    placeholder="e.g. Literary prizes or fellowships"
                  />
                </View>
              </View>
            )}

            {/* ─── MUSICIAN TAB ─── */}
            {pursuit === 'MUSICIAN' && (
              <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
                  Musician
                </Text>
                <View className="gap-4">
                  <FormField
                    testID="field-genre"
                    label="Genre"
                    value={musicianGenre}
                    onChangeText={setMusicianGenre}
                    placeholder="e.g. Jazz, Electronic, Classical"
                  />
                  <FormField
                    testID="field-instruments"
                    label="Instruments"
                    value={musicianInstruments}
                    onChangeText={setMusicianInstruments}
                    placeholder="e.g. Synthesizers, Piano, Trumpet"
                  />
                  <FormField
                    testID="field-releases"
                    label="Releases"
                    value={musicianReleases}
                    onChangeText={setMusicianReleases}
                    placeholder="e.g. Key albums or compositions"
                  />
                  <FormField
                    testID="field-collaborations"
                    label="Collaborations"
                    value={musicianCollabs}
                    onChangeText={setMusicianCollabs}
                    placeholder="e.g. Ensembles or producers"
                  />
                </View>
              </View>
            )}

            {/* ─── PERFORMER TAB ─── */}
            {pursuit === 'PERFORMER' && (
              <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
                  Performer
                </Text>
                <View className="gap-4">
                  <FormField
                    testID="field-medium"
                    label="Medium"
                    value={performerMedium}
                    onChangeText={setPerformerMedium}
                    placeholder="e.g. Stage, Cinema, Voice"
                  />
                  <FormField
                    testID="field-role"
                    label="Role"
                    value={performerRole}
                    onChangeText={setPerformerRole}
                    placeholder="e.g. Signature characters"
                  />
                  <FormField
                    testID="field-productions"
                    label="Productions"
                    value={performerProductions}
                    onChangeText={setPerformerProductions}
                    placeholder="e.g. Notable works or tours"
                  />
                  <FormField
                    testID="field-honors"
                    label="Honors"
                    value={performerHonors}
                    onChangeText={setPerformerHonors}
                    placeholder="e.g. Nominations or awards"
                  />
                </View>
              </View>
            )}

            {/* ─── CUSTOM TAB ─── */}
            {pursuit === 'CUSTOM' && (
              <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
                  Custom
                </Text>
                <View className="gap-4">
                  <FormField
                    testID="field-custom-calling"
                    label="Calling"
                    value={customCalling}
                    onChangeText={setCustomCalling}
                    placeholder="e.g. Discipline or practice"
                  />
                  <FormField
                    testID="field-custom-innovation"
                    label="Innovation"
                    value={customInnovation}
                    onChangeText={setCustomInnovation}
                    placeholder="e.g. Core breakthrough"
                  />
                  <FormField
                    testID="field-custom-milestone"
                    label="Milestone"
                    value={customMilestone}
                    onChangeText={setCustomMilestone}
                    placeholder="e.g. Key achievement"
                  />
                  <FormField
                    testID="field-custom-philosophy"
                    label="Philosophy"
                    value={customPhilosophy}
                    onChangeText={setCustomPhilosophy}
                    placeholder="e.g. Guiding principle"
                  />
                </View>
              </View>
            )}

            {/* Custom Attributes Section (Available on Creator & Custom tabs) */}
            {(pursuit === 'CREATOR' || pursuit === 'CUSTOM') && (
              <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
                <View className="flex-row items-center justify-between border-b border-border/40 pb-2.5">
                  <Text className="font-bold text-base text-text">
                    Custom
                  </Text>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Plus}
                    onPress={handleAddCustomField}
                  >
                    Add Field
                  </Button>
                </View>

                {customFields.length === 0 ? (
                  <Text variant="caption" className="text-muted-text text-sm italic py-1">
                    No custom fields added yet. Click &quot;Add Field&quot; to define custom card stats.
                  </Text>
                ) : (
                  <View className="gap-3">
                    {customFields.map((cf) => (
                      <View key={cf.id} className="flex-row items-center gap-3">
                        <View className="w-1/3">
                          <TextInput
                            value={cf.label}
                            onChangeText={(t) => handleUpdateCustomField(cf.id, 'label', t)}
                            placeholder="Field Name"
                            placeholderTextColor={mutedColor}
                            className="rounded-xl border border-border bg-canvas px-4 py-3 text-sm font-semibold text-text"
                            style={{ outline: 'none' } as never}
                          />
                        </View>
                        <View className="flex-1">
                          <TextInput
                            value={cf.value}
                            onChangeText={(t) => handleUpdateCustomField(cf.id, 'value', t)}
                            placeholder="Value"
                            placeholderTextColor={mutedColor}
                            className="rounded-xl border border-border bg-canvas px-4 py-3 text-sm text-text"
                            style={{ outline: 'none' } as never}
                          />
                        </View>
                        <Pressable
                          onPress={() => handleRemoveCustomField(cf.id)}
                          className="p-2 active:opacity-60"
                          accessibilityLabel="Delete field"
                        >
                          <Trash2 size={16} color={mutedColor} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Save Action */}
            <View className="flex-row items-center gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                icon={Check}
                isLoading={updateProfile.isPending}
                onPress={handleSaveProfile}
              >
                {savedSuccess ? 'Saved' : 'Save'}
              </Button>
              {savedSuccess ? (
                <Text variant="caption" className="text-sm font-semibold text-emerald-600">
                  ✓ Saved
                </Text>
              ) : null}
              {saveError ? (
                <Text variant="caption" className="text-sm font-semibold text-red-500">
                  {saveError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Right Column: User Media Grid & Uploads */}
          <View className="w-full lg:w-1/2">
            <AccountMediaGrid athleteProfileId={athleteProfileId} />
          </View>
        </View>
      </View>
    </Screen>
  )
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  testID,
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  multiline?: boolean
  numberOfLines?: number
  testID?: string
}) {
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-text">
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={mutedColor}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-sm text-text"
        style={{
          outline: 'none',
          ...(multiline ? { minHeight: 80, textAlignVertical: 'top' } : {}),
        } as never}
      />
    </View>
  )
}
