import type { components } from '@statman/sdk'
import { SidebarActionRow, SidebarBrandPanel, SidebarGlanceRow, SidebarPanel, SidebarRail } from '@/shared/layout'

type User = components['schemas']['User']
type MeCapabilities = components['schemas']['MeCapabilities']

export function MeSidebar({ user, capabilities }: { user: User; capabilities?: MeCapabilities }) {
  const athleteProfiles = capabilities?.athleteProfiles ?? []
  const reporterAssignments = capabilities?.reporterAssignments ?? []
  const isAdmin = user.role === 'ADMIN'

  return (
    <SidebarRail>
      <SidebarBrandPanel title="Me" subtitle={user.profile?.displayName ?? user.profile?.username ?? user.email} />

      <SidebarPanel title="Summary">
        <SidebarGlanceRow label="Profiles" value={`${athleteProfiles.length}`} />
        <SidebarGlanceRow label="Assignments" value={`${reporterAssignments.length}`} />
        <SidebarGlanceRow label="Role" value={isAdmin ? 'Admin' : 'Neutral'} />
      </SidebarPanel>

      <SidebarPanel title="Quick actions">
        <SidebarActionRow title="Disputes & corrections" meta="Submit and track corrections." href={{ pathname: '/disputes' }} />
        {isAdmin ? (
          <>
            <SidebarActionRow title="Claims queue" meta="Review pending athlete claims." href={{ pathname: '/claims' }} />
            <SidebarActionRow title="Admin hub" meta="Management tools and ops." href={{ pathname: '/admin' }} />
          </>
        ) : null}
      </SidebarPanel>
    </SidebarRail>
  )
}

