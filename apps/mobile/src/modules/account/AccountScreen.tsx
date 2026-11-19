import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Plus,
  Trash2,
  LogOut,
  Check,
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
  | 'ACTOR'
  | 'CUSTOM'

interface CustomField {
  id: string
  label: string
  value: string
}

const PURSUIT_OPTIONS: Array<{
  id: PursuitFocus
  label: string
  icon: any
}> = [
  { id: 'CREATOR', label: 'Creator', icon: Palette },
  { id: 'ATHLETE', label: 'Athlete', icon: Trophy },
  { id: 'WRITER', label: 'Writer', icon: BookOpen },
  { id: 'MUSICIAN', label: 'Musician', icon: Music },
  { id: 'ACTOR', label: 'Performer', icon: Film },
  { id: 'CUSTOM', label: 'Custom', icon: Zap },
]

export function AccountScreen() {
  const router = useRouter()
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  const { isError, isLoading, logout, user, capabilities } = useAccountSession()

  // State for Personal Card Content Builder
  const [pursuit, setPursuit] = useState<PursuitFocus>('CREATOR')

  // Dynamic pursuit fields
  const [field1, setField1] = useState('Visual Design & Collectibles')
  const [field2, setField2] = useState('Studio RARE')
  const [field3, setField3] = useState('Genesis Flagship 2026')
  const [field4, setField4] = useState('Minimalist Typography')

  // Universal Personal Attributes
  const [hometown, setHometown] = useState('')
  const [signatureQuote, setSignatureQuote] = useState('Bold simplicity in creative collecting.')
  const [debutYear, setDebutYear] = useState('2026')

  // User-defined dynamic custom fields
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 'cf-1', label: 'Primary Medium', value: 'Physical & Digital Prints' },
  ])

  const [savedSuccess, setSavedSuccess] = useState(false)

  if (isLoading) {
    return (
      <Screen insetTop={false}>
        <LoadingState />
      </Screen>
    )
  }

  if (isError || !user) {
    return (
      <Screen title="Personal" insetTop={false}>
        <View className="w-full max-w-xl mx-auto py-16 px-4">
          <SignInPrompt message="Sign in to customize your personal card attributes." />
        </View>
      </Screen>
    )
  }

  const displayName = user.profile?.displayName ?? user.profile?.username ?? user.email ?? 'Creator'
  const username = user.profile?.username ?? user.email?.split('@')[0] ?? 'collector'
  const athleteProfileId = capabilities?.athleteProfiles?.[0]?.athleteProfileId ?? user.profile?.id ?? null

  function handleSwitchPursuit(newPursuit: PursuitFocus) {
    setPursuit(newPursuit)
    if (newPursuit === 'ATHLETE') {
      setField1('Basketball')
      setField2('Point Guard')
      setField3('28.4 PPG · 50-40-90 Club')
      setField4('All-Star Team MVP')
    } else if (newPursuit === 'CREATOR') {
      setField1('Visual Design & Collectibles')
      setField2('Studio RARE')
      setField3('Genesis Flagship 2026')
      setField4('Minimalist Typography')
    } else if (newPursuit === 'WRITER') {
      setField1('Poetry & Essays')
      setField2('Still We Rise')
      setField3('Civil Rights Literature')
      setField4('National Book Award')
    } else if (newPursuit === 'MUSICIAN') {
      setField1('Ambient & Electronic')
      setField2('Moog Synthesizers, Piano')
      setField3('Subsolar Horizon EP')
      setField4('Soundtrack of the Year')
    } else if (newPursuit === 'ACTOR') {
      setField1('Cinema & Stage')
      setField2('Detective Vance')
      setField3('Midnight in Soho')
      setField4('Golden Globe Nominee')
    } else {
      setField1('Architecture & Spatial Design')
      setField2('Carbon-Neutral Structures')
      setField3('Pritzker Honor 2025')
      setField4('Sustainable Form & Function')
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

  function handleSaveProfile() {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Active pursuit field labels
  const pursuitLabels = {
    CREATOR: { f1: 'Creative Domain', f2: 'Studio / Channel', f3: 'Flagship Project', f4: 'Signature Style' },
    ATHLETE: { f1: 'Sport / Discipline', f2: 'Position / Role', f3: 'Primary Statistic', f4: 'Accolades / Titles' },
    WRITER: { f1: 'Literary Focus', f2: 'Flagship Work', f3: 'Era / Movement', f4: 'Major Honors' },
    MUSICIAN: { f1: 'Primary Genre', f2: 'Instruments / Gear', f3: 'Key Releases', f4: 'Notable Collaborations' },
    ACTOR: { f1: 'Primary Medium', f2: 'Signature Role', f3: 'Notable Productions', f4: 'Accolades & Honors' },
    CUSTOM: { f1: 'Discipline / Calling', f2: 'Core Innovation', f3: 'Milestone Achievement', f4: 'Motto & Philosophy' },
  }[pursuit]

  const activePursuitLabel = PURSUIT_OPTIONS.find((p) => p.id === pursuit)?.label ?? 'Attributes'

  return (
    <Screen title="Personal" insetTop={false} scroll>
      <View className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 gap-8 md:gap-10 pb-28">
        {/* 1. Identity Header */}
        <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 shadow-xs flex-row flex-wrap items-center justify-between gap-6">
          <View className="flex-row items-center gap-4 flex-1 min-w-[240px]">
            <Avatar
              uri={user.profile?.avatarUrl}
              fallback={displayName}
              size="lg"
              className="border-2 border-border shadow-xs"
            />
            <View className="gap-0.5 min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-extrabold tracking-tight text-text" numberOfLines={1}>
                  {displayName}
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

        {/* 2. Main Two-Column Layout: Personal Fields on Left, Media Library Grid on Right */}
        <View className="flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Personal Attributes Form */}
          <View className="w-full lg:w-1/2 gap-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold tracking-tight text-text">
                Personal Fields
              </Text>
            </View>

          {/* Pursuit Segmented Selector */}
          <View className="flex-row flex-wrap gap-2">
            {PURSUIT_OPTIONS.map((opt) => {
              const active = pursuit === opt.id
              const Icon = opt.icon
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => handleSwitchPursuit(opt.id)}
                  className={cn(
                    'flex-row items-center gap-2 rounded-xl border px-3.5 py-2.5 active:opacity-70 transition-all',
                    active
                      ? 'border-brand bg-brand/10 shadow-xs'
                      : 'border-border/80 bg-surface hover:border-brand/40'
                  )}
                >
                  <Icon size={15} color={active ? brandColor : mutedColor} />
                  <Text className={cn('text-sm font-semibold', active ? 'text-brand' : 'text-text')}>
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          {/* Conditional Attributes for Active Pursuit */}
          <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
            <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
              {activePursuitLabel} Attributes
            </Text>

            <View className="gap-4">
              <FormField
                label={pursuitLabels.f1}
                value={field1}
                onChangeText={setField1}
                placeholder="e.g. Visual Design"
              />
              <FormField
                label={pursuitLabels.f2}
                value={field2}
                onChangeText={setField2}
                placeholder="e.g. Studio Name or Team"
              />
              <FormField
                label={pursuitLabels.f3}
                value={field3}
                onChangeText={setField3}
                placeholder="e.g. Flagship Project or Record"
              />
              <FormField
                label={pursuitLabels.f4}
                value={field4}
                onChangeText={setField4}
                placeholder="e.g. Style or Accolade"
              />
            </View>
          </View>

          {/* Universal Personal Attributes */}
          <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
            <Text className="font-bold text-base text-text border-b border-border/40 pb-2.5">
              Bio & Background
            </Text>

            <View className="gap-4">
              <FormField
                label="Hometown / Origin"
                value={hometown}
                onChangeText={setHometown}
                placeholder="e.g. Chicago, IL or London, UK"
              />
              <FormField
                label="Signature Quote / Philosophy"
                value={signatureQuote}
                onChangeText={setSignatureQuote}
                placeholder="A phrase or motto featured on card backs"
              />
              <FormField
                label="Debut / Milestone Year"
                value={debutYear}
                onChangeText={setDebutYear}
                placeholder="e.g. 2026"
              />
            </View>
          </View>

          {/* Dynamic Custom Fields Section */}
          <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
            <View className="flex-row items-center justify-between border-b border-border/40 pb-2.5">
              <Text className="font-bold text-base text-text">
                Custom Attributes
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
          </View>

          {/* Save Action */}
          <View className="flex-row items-center gap-4 pt-2">
            <Button size="lg" variant="primary" icon={Check} onPress={handleSaveProfile}>
              {savedSuccess ? 'Saved' : 'Save Attributes'}
            </Button>
            {savedSuccess ? (
              <Text variant="caption" className="text-sm font-semibold text-emerald-600">
                ✓ Attributes saved
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
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
}) {
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-text">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={mutedColor}
        className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-sm text-text"
        style={{ outline: 'none' } as never}
      />
    </View>
  )
}

