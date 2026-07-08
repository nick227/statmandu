import { View } from 'react-native'
import { useState } from 'react'
import { useCreateSourceReference, useCurrentUser, useDisputes, useImages, useSources } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ConnectedImageUploadButton } from '@/modules/media/ConnectedImageUploadButton'

export interface ConnectedSourcesPanelProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME' | 'ATHLETE_PROFILE' | 'GAME_STAT_LINE'
  targetId: string
  className?: string
}

// Reused as-is on Player/Team/Game — same shape, different targetType/targetId.
// Sources and disputes share one tab per the site map's "Sources & Disputes"
// surface rather than splitting into two tabs per entity.
export function ConnectedSourcesPanel({ targetType, targetId, className }: ConnectedSourcesPanelProps) {
  const [sourceType, setSourceType] = useState<'SCOREBOOK_PHOTO' | 'YOUTUBE' | 'OTHER'>('SCOREBOOK_PHOTO')
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const currentUserQuery = useCurrentUser()
  const sourcesQuery = useSources(targetType, targetId)
  const disputesQuery = useDisputes(targetType, targetId)
  const imagesQuery = useImages(targetType, targetId, 'EVIDENCE')
  const createSource = useCreateSourceReference()
  const sources = sourcesQuery.data?.data ?? []
  const disputes = disputesQuery.data?.data ?? []
  const images = imagesQuery.data?.data ?? []
  const canAddSource = Boolean(currentUserQuery.data)

  async function addSource() {
    await createSource.mutateAsync({
      targetType,
      targetId,
      sourceType,
      url: url || undefined,
      label: label || undefined,
    })
    setUrl('')
    setLabel('')
  }

  const isImageEvidence = sourceType === 'SCOREBOOK_PHOTO'

  return (
    <View className={className ?? 'px-lg gap-lg'}>
      <View className="gap-sm">
        <Text className="font-semibold">Sources</Text>
        {sources.length === 0 ? (
          <Text variant="caption">No sources cited yet.</Text>
        ) : (
          sources.map((s) => (
            <View key={s.id} className="flex-row items-center justify-between border-b border-border py-sm">
              <Text>{s.label ?? s.sourceType.replace(/_/g, ' ')}</Text>
              {s.url ? <Text variant="caption">{s.url}</Text> : null}
            </View>
          ))
        )}
        {images.length > 0 ? (
          <View className="gap-xs">
            {images.map((image) => (
              <View key={image.id} className="flex-row items-center justify-between border-b border-border py-sm">
                <Text>{image.originalFilename ?? 'Uploaded image'}</Text>
                <Badge tone="verified">Image</Badge>
              </View>
            ))}
          </View>
        ) : null}
        {canAddSource ? (
          <View className="gap-sm rounded-md border border-border bg-surface p-md">
            <Text variant="caption">Add evidence</Text>
            <View className="flex-row gap-sm">
              {[
                ['SCOREBOOK_PHOTO', 'Photo'],
                ['YOUTUBE', 'Video'],
                ['OTHER', 'Link'],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={sourceType === value ? 'primary' : 'secondary'}
                  className="flex-1"
                  onPress={() => setSourceType(value as typeof sourceType)}
                >
                  {label}
                </Button>
              ))}
            </View>
            {isImageEvidence ? (
              <ConnectedImageUploadButton
                targetType={targetType}
                targetId={targetId}
                usage="EVIDENCE"
                label="Upload Evidence Image"
                allowsEditing={false}
              />
            ) : (
              <>
                <Input placeholder={sourceType === 'YOUTUBE' ? 'YouTube URL' : 'Source URL'} autoCapitalize="none" value={url} onChangeText={setUrl} />
                <Input placeholder="Label (optional)" value={label} onChangeText={setLabel} />
                <Button size="sm" isLoading={createSource.isPending} disabled={!url} onPress={addSource}>Add Evidence</Button>
              </>
            )}
          </View>
        ) : null}
      </View>

      <View className="gap-sm">
        <Text className="font-semibold">Disputes</Text>
        {disputes.length === 0 ? (
          <Text variant="caption">No disputes on record.</Text>
        ) : (
          disputes.map((d) => (
            <View key={d.id} className="gap-xs border-b border-border py-sm">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-sm">{d.description}</Text>
                <Badge tone={d.status === 'OPEN' ? 'dispute' : 'verified'}>{d.status}</Badge>
              </View>
              {d.resolutionNote ? <Text variant="caption">{d.resolutionNote}</Text> : null}
            </View>
          ))
        )}
      </View>
    </View>
  )
}
