import type { ReactNode } from 'react'
import { View } from 'react-native'
import { BackButton } from '@/shared/ui/BackButton'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Screen, type ScreenProps } from './Screen'

export interface ScreenStateProps extends Pick<ScreenProps, 'title' | 'className' | 'contentClassName'> {
  message?: string
  label?: string
  withBack?: boolean
  backTone?: 'light' | 'dark'
}

function ScreenStateShell({ title, className, contentClassName, withBack, backTone = 'dark', children }: ScreenStateProps & { children: ReactNode }) {
  return (
    <Screen title={title} className={className} contentClassName={contentClassName}>
      {withBack ? <View className="px-lg pb-md"><BackButton tone={backTone} /></View> : null}
      {children}
    </Screen>
  )
}

export function LoadingScreenState({ message, label = message, ...props }: ScreenStateProps) {
  return (
    <ScreenStateShell {...props}>
      <LoadingState label={label} />
    </ScreenStateShell>
  )
}

export function ErrorScreenState({ message, ...props }: ScreenStateProps) {
  return (
    <ScreenStateShell {...props}>
      <ErrorState className="flex-1 items-center justify-center p-lg gap-sm" message={message} />
    </ScreenStateShell>
  )
}
