import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { CheckCircle2, AlertTriangle } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import { useStatusNativeColor } from '@/lib/theme'

type Player = components['schemas']['Player']

export interface AthleteCardProps extends PressableProps {
  player: Player
  className?: string
  style?: StyleProp<ViewStyle>
}

function formatHeight(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

function VitalChip({ label }: { label: string }) {
  return (
    <View className="rounded-sm border border-border bg-canvas px-sm py-xs">
      <Text variant="statLabel" className="text-muted-text">{label}</Text>
    </View>
  )
}

function StatusMark({ status }: { status: string }) {
  const verifiedColor = useStatusNativeColor('verified')
  const disputeColor = useStatusNativeColor('dispute')
  if (status === 'VERIFIED_TEAM_ACCOUNT') {
    return (
      <View className="flex-row items-center gap-xs rounded-pill bg-verified/15 px-sm py-xs">
        <CheckCircle2 size={12} color={verifiedColor} />
        <Text variant="statLabel" className="text-verified">Verified</Text>
      </View>
    )
  }
  if (status === 'IN_DISPUTE') {
    return (
      <View className="flex-row items-center gap-xs rounded-pill bg-dispute/15 px-sm py-xs">
        <AlertTriangle size={12} color={disputeColor} />
        <Text variant="statLabel" className="text-dispute">Disputed</Text>
      </View>
    )
  }
  return null
}

export function AthleteCard({ player, className, style, ...props }: AthleteCardProps) {
  const { athleteProfile, currentTeam, position, jerseyNumber, classYear, heightInches, sport } = player
  const name = `${athleteProfile.firstName} ${athleteProfile.lastName}`
  const vitals = [
    position,
    classYear ? `Class of ${classYear}` : null,
    heightInches != null ? formatHeight(heightInches) : null,
  ].filter(Boolean) as string[]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}${currentTeam?.name ? `, ${currentTeam.name}` : ''}`}
      className={cn('active:opacity-80', className)}
      style={style}
      {...props}
    >
      <View className="overflow-hidden rounded-md border border-border bg-surface">
        <View className="h-1 bg-sport-accent" />

        <View className="gap-sm p-md">
          <View className="flex-row items-center justify-between gap-sm">
            {jerseyNumber != null ? (
              <View className="min-w-[36px] items-center rounded-sm bg-canvas px-sm py-xs">
                <Text className="text-base font-bold leading-4 text-text">#{jerseyNumber}</Text>
              </View>
            ) : (
              <View />
            )}
            <StatusMark status={athleteProfile.sourceStatus} />
          </View>

          <View className="flex-row items-center gap-md">
            <View className="rounded-full border-2 border-sport-accent/30 p-xs">
              <Avatar uri={athleteProfile.avatarUrl} fallback={name} size="md" />
            </View>
            <View className="min-w-0 flex-1 gap-xs">
              <Text className="text-base font-bold text-text" numberOfLines={2}>{name}</Text>
              <Text variant="caption" className="font-medium text-text" numberOfLines={1}>
                {currentTeam?.name ?? 'Free agent'}
              </Text>
              <Text variant="statLabel" className="text-sport-accent">
                {sport?.name ?? 'Athlete'}
              </Text>
            </View>
          </View>

          {vitals.length > 0 ? (
            <View className="flex-row flex-wrap gap-xs">
              {vitals.map((label) => (
                <VitalChip key={label} label={label} />
              ))}
            </View>
          ) : null}

          {athleteProfile.hometown || athleteProfile.claimedByUsername ? (
            <View className="flex-row flex-wrap items-center gap-sm border-t border-border pt-sm">
              {athleteProfile.hometown ? (
                <Text variant="caption" className="flex-1" numberOfLines={1}>
                  {athleteProfile.hometown}
                </Text>
              ) : null}
              {athleteProfile.claimedByUsername ? (
                <Text variant="caption" numberOfLines={1}>
                  @{athleteProfile.claimedByUsername}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}
