import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Plus,
  Trash2,
  LogOut,
  Check,
  User,
  Sparkles,
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

interface CustomField {
  id: string
  label: string
  value: string
}

export function AccountScreen() {
  const router = useRouter()
  const mutedColor = useNativeColor('mutedText')

  const { isError, isLoading, logout, user, capabilities } = useAccountSession()

  // General Profile Fields (in prime field space: Name, Location, Age, Calling, Bio)
  const [displayName, setDisplayName] = useState(user?.profile?.displayName ?? '')
  const [location, setLocation] = useState((user?.profile as any)?.hometown ?? '')
  const [age, setAge] = useState('')
  const [calling, setCalling] = useState('')
  const [bio, setBio] = useState(user?.profile?.bio ?? '')

  // Additional Presentation Details
  const [signatureQuote, setSignatureQuote] = useState('')
  const [debutYear, setDebutYear] = useState('')

  // Dynamic Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([])

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

  const headerDisplayName = displayName || user.profile?.displayName || user.profile?.username || user.email || 'Collector'
  const username = user.profile?.username ?? user.email?.split('@')[0] ?? 'collector'
  const athleteProfileId = capabilities?.athleteProfiles?.[0]?.athleteProfileId ?? user.profile?.id ?? null

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

  return (
    <Screen title="Personal" insetTop={false} scroll>
      <View className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 gap-8 md:gap-10 pb-28">
        {/* 1. Identity Header */}
        <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 shadow-xs flex-row flex-wrap items-center justify-between gap-6">
          <View className="flex-row items-center gap-4 flex-1 min-w-[240px]">
            <Avatar
              uri={user.profile?.avatarUrl}
              fallback={headerDisplayName}
              size="lg"
              className="border-2 border-border shadow-xs"
            />
            <View className="gap-0.5 min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-extrabold tracking-tight text-text" numberOfLines={1}>
                  {headerDisplayName}
                </Text>
                <Badge tone="verified">Member</Badge>
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

        {/* 2. Main Two-Column Layout: Profile Details on Left, Media Library Grid on Right */}
        <View className="flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Profile Attributes Form */}
          <View className="w-full lg:w-1/2 gap-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold tracking-tight text-text">
                Profile Details
              </Text>
            </View>

            {/* Prime Field Space: General Information (Name, Location, Age, Calling, Bio) */}
            <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
              <View className="flex-row items-center gap-2 border-b border-border/40 pb-2.5">
                <User size={18} className="text-brand" />
                <Text className="font-bold text-base text-text">
                  General Information
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
                  label="Calling / Profession"
                  value={calling}
                  onChangeText={setCalling}
                  placeholder="e.g. Designer, Software Engineer, Athlete"
                />

                <FormField
                  testID="field-bio"
                  label="Bio / About"
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell your story, achievements, or collecting focus..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Additional Presentation Details */}
            <View className="rounded-2xl border border-border/80 bg-surface p-6 md:p-8 gap-5 shadow-xs">
              <View className="flex-row items-center gap-2 border-b border-border/40 pb-2.5">
                <Sparkles size={18} className="text-brand" />
                <Text className="font-bold text-base text-text">
                  Card Presentation Details
                </Text>
              </View>

              <View className="gap-4">
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

            {/* Custom Attributes Section */}
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

              {customFields.length === 0 ? (
                <Text variant="caption" className="text-muted-text text-sm italic py-1">
                  No custom attributes added yet. Click &quot;Add Field&quot; to define custom card stats.
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

            {/* Save Action */}
            <View className="flex-row items-center gap-4 pt-2">
              <Button size="lg" variant="primary" icon={Check} onPress={handleSaveProfile}>
                {savedSuccess ? 'Saved' : 'Save Profile'}
              </Button>
              {savedSuccess ? (
                <Text variant="caption" className="text-sm font-semibold text-emerald-600">
                  ✓ Profile saved
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
