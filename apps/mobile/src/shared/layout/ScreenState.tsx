import type { ReactNode } from 'react'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Screen, type ScreenProps } from './Screen'

export interface ScreenStateProps extends Pick<ScreenProps, 'title' | 'className' | 'contentClassName' | 'withBack'> {
  message?: string
  label?: string
}

function ScreenStateShell({ title, className, contentClassName, withBack, children }: ScreenStateProps & { children: ReactNode }) {
  return (
    <Screen title={title} className={className} contentClassName={contentClassName} withBack={withBack}>
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
