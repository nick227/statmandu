import { useMemo } from 'react'
import { useCurrentUser, useFollows, useCreateFollow, useDeleteFollow } from '@statman/sdk'
import { Button } from '@/shared/ui/Button'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'

export interface ConnectedFollowButtonProps {
  targetType: 'PLAYER' | 'TEAM'
  targetId: string
  className?: string
}

export function ConnectedFollowButton({ targetType, targetId, className }: ConnectedFollowButtonProps) {
  const { data: me, isLoading: isAuthLoading } = useCurrentUser()
  const { data: follows, isLoading } = useFollows(targetType, targetId)
  const create = useCreateFollow()
  const remove = useDeleteFollow(targetType, targetId)

  const myFollow = useMemo(
    () => follows?.data.find((f) => f.followerId === me?.data.id),
    [follows, me]
  )

  if (isAuthLoading || isLoading) return null

  if (!me) {
    return <SignInPrompt message="Sign in to follow" className={className ?? 'py-sm'} />
  }

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
