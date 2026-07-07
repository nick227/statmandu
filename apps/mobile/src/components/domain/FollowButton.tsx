import { useMemo } from 'react'
import { useCurrentUser, useFollows, useCreateFollow, useDeleteFollow } from '@statman/sdk'
import { Button } from '@/components/ui/Button'

export interface FollowButtonProps {
  targetType: 'PLAYER' | 'TEAM'
  targetId: string
  className?: string
}

// Self-contained: owns its own follow/unfollow mutation state so every
// entity page can drop it in without lifting follow state up to the page
// level (unlike list/card components, which stay props-only — see
// docs/frontend-architecture.md for the rationale on this one exception).
export function FollowButton({ targetType, targetId, className }: FollowButtonProps) {
  const { data: me } = useCurrentUser()
  const { data: follows, isLoading } = useFollows(targetType, targetId)
  const create = useCreateFollow()
  const remove = useDeleteFollow(targetType, targetId)

  const myFollow = useMemo(
    () => follows?.data.find((f) => f.followerId === me?.data.id),
    [follows, me]
  )

  if (isLoading || !me) return null

  const isFollowing = Boolean(myFollow)

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size="sm"
      className={className}
      isLoading={create.isPending || remove.isPending}
      onPress={() => {
        if (isFollowing && myFollow) remove.mutate(myFollow.id)
        else create.mutate({ targetType, targetId })
      }}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
