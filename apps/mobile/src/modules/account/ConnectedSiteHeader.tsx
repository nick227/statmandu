import { SiteHeader } from '@/shared/layout/SiteHeader'
import { MobileTabBar } from '@/shared/layout/MobileTabBar'
import { useAccountSession } from '@/modules/account/useAccountSession'

/** Shell chrome wired to the current session. */
export function ConnectedSiteHeader() {
  const { user } = useAccountSession()

  return (
    <SiteHeader
      user={
        user
          ? {
              avatarUrl: user.profile?.avatarUrl,
              displayName: user.profile?.displayName,
              email: user.email,
            }
          : null
      }
    />
  )
}

/** Route-shell adapter keeps layout primitives out of Expo route files. */
export function ConnectedMobileTabBar() {
  return <MobileTabBar />
}
