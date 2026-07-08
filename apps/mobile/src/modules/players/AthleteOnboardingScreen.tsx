import { Pressable, View } from 'react-native'
import { Stack } from 'expo-router'
import { Check, Minus, Plus, ShieldCheck } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Badge } from '@/shared/ui/Badge'
import { Card, CardContent } from '@/shared/ui/Card'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Screen } from '@/shared/layout'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { PLAYER_POSITIONS, useAthleteOnboarding } from '@/modules/players/useAthleteOnboarding'
import { cn } from '@/lib/utils'

function formatHeight(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

export function AthleteOnboardingScreen() {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const wizard = useAthleteOnboarding()

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Build Profile' }} />
        <SignInPrompt message="Sign in to create and own an athlete profile." />
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Build Profile' }} />
      <Screen scroll contentClassName="gap-md p-lg" style={{ paddingTop: 0 }}>
        <View className="gap-xs">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Build Profile</Text>
            <Badge tone="brand">{`${wizard.stepIndex + 1} of ${wizard.steps.length}`}</Badge>
          </View>
          <Text variant="caption">{wizard.step}</Text>
        </View>

        <Card>
          <CardContent className="gap-md">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold">{wizard.name || 'Your name'}</Text>
                <Text variant="caption">{[wizard.position, wizard.classYear ? `Class of ${wizard.classYear}` : null].filter(Boolean).join(' · ') || 'Basketball profile'}</Text>
              </View>
              <Badge tone={wizard.completion >= 70 ? 'verified' : 'muted-text'}>{`${wizard.completion}%`}</Badge>
            </View>
            <View className="h-2 overflow-hidden rounded-pill bg-muted-text/15">
              <View className="h-full rounded-pill bg-sport-accent" style={{ width: `${wizard.completion}%` }} />
            </View>
          </CardContent>
        </Card>

        {wizard.step === 'Identity' ? (
          <View className="gap-sm">
            <Input placeholder="Full name" value={wizard.name} onChangeText={wizard.setName} />
            <Input placeholder="Hometown" value={wizard.hometown} onChangeText={wizard.setHometown} />
            <Textarea placeholder="Short bio" value={wizard.bio} onChangeText={wizard.setBio} />
          </View>
        ) : null}

        {wizard.step === 'Sport Fit' ? (
          <View className="gap-md">
            <View className="gap-sm">
              <Text className="font-semibold">Position</Text>
              <View className="flex-row gap-sm">
                {PLAYER_POSITIONS.map((position) => {
                  const selected = wizard.position === position
                  return (
                    <Pressable
                      key={position}
                      onPress={() => wizard.selectPosition(position)}
                      className={cn(
                        'flex-1 items-center rounded-md border px-sm py-md active:opacity-70',
                        selected ? 'border-sport-accent bg-sport-accent' : 'border-border bg-surface'
                      )}
                    >
                      <Text className={cn('font-semibold', selected ? 'text-white' : 'text-text')}>{position}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
            <View className="gap-sm">
              <Text className="font-semibold">Height</Text>
              <View className="flex-row items-center justify-between rounded-md border border-border bg-surface p-md">
                <Pressable onPress={() => wizard.adjustHeight(-1)} className="rounded-full bg-muted-text/10 p-md active:opacity-70">
                  <Minus size={18} />
                </Pressable>
                <Text className="text-3xl font-bold">{formatHeight(wizard.heightInches)}</Text>
                <Pressable onPress={() => wizard.adjustHeight(1)} className="rounded-full bg-muted-text/10 p-md active:opacity-70">
                  <Plus size={18} />
                </Pressable>
              </View>
            </View>
            <View className="flex-row gap-sm">
              <Input className="flex-1" placeholder="Class year" keyboardType="number-pad" value={wizard.classYear} onChangeText={wizard.setClassYear} />
              <Input className="flex-1" placeholder="Jersey" keyboardType="number-pad" value={wizard.jerseyNumber} onChangeText={wizard.setJerseyNumber} />
            </View>
          </View>
        ) : null}

        {wizard.step === 'Team' ? (
          <View className="gap-sm">
            <Input placeholder="Team name" value={wizard.teamName} onChangeText={wizard.setTeamName} />
            <Text variant="caption">Team matching will connect this profile to a roster once the team is managed in Statman.</Text>
          </View>
        ) : null}

        {wizard.step === 'Proof' ? (
          <View className="gap-sm">
            <Badge tone="verified" icon={ShieldCheck}>Ownership</Badge>
            <Textarea placeholder="Verification note, coach contact, or source link" value={wizard.proofNote} onChangeText={wizard.setProofNote} />
          </View>
        ) : null}

        {wizard.step === 'Media' ? (
          <View className="gap-sm">
            <Input placeholder="YouTube highlight URL" autoCapitalize="none" value={wizard.mediaUrl} onChangeText={wizard.setMediaUrl} />
            <Text variant="caption">Media attachment comes next; this first pass saves the athlete profile.</Text>
          </View>
        ) : null}

        {wizard.step === 'Preview' ? (
          <View className="gap-sm">
            <Badge tone="verified" icon={Check}>Ready</Badge>
            <Text className="font-semibold">{wizard.name || 'Your athlete profile'}</Text>
            <Text variant="caption">{[wizard.position, wizard.classYear ? `Class of ${wizard.classYear}` : null, wizard.hometown].filter(Boolean).join(' · ')}</Text>
            {wizard.bio ? <Text>{wizard.bio}</Text> : null}
          </View>
        ) : null}

        <View className="flex-row gap-sm pt-sm">
          <Button variant="secondary" className="flex-1" disabled={!wizard.canGoBack} onPress={wizard.goBack}>Back</Button>
          {wizard.isLastStep ? (
            <Button className="flex-1" isLoading={wizard.createPlayer.isPending} disabled={!wizard.name.trim()} onPress={wizard.publish}>Publish</Button>
          ) : (
            <Button className="flex-1" onPress={wizard.goNext}>Next</Button>
          )}
        </View>
      </Screen>
    </>
  )
}
