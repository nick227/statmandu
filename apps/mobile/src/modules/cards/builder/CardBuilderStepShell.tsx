import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'

export function CardBuilderStepShell({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  isNextDisabled = false,
  isLoading = false,
}: {
  title: string
  description?: string
  children: ReactNode
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  isLoading?: boolean
}) {
  return (
    <View className="flex-1">
      <View className="px-lg pt-lg pb-md">
        <Text variant="entityName" className="text-text text-center mb-xs">
          {title}
        </Text>
        {description ? <Text className="text-muted-text text-center">{description}</Text> : null}
      </View>

      <View className="flex-1 px-md">
        {children}
      </View>

      <View className="p-lg gap-md mt-auto">
        <Button
          onPress={onNext}
          disabled={isNextDisabled}
          isLoading={isLoading}
          size="lg"
        >
          {nextLabel}
        </Button>

        {onBack ? (
          <Button onPress={onBack} disabled={isLoading} variant="ghost" size="lg">
            Back
          </Button>
        ) : null}
      </View>
    </View>
  )
}

