import React, { useState } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  useCreateRelease,
  useGenerateRelease,
  usePublishRelease,
  useClaimRelease,
  generateStableRequestId,
  type CardRelease,
  type CardEditionMode,
} from './hooks/useReleases'
import type { CardDesign } from './hooks/useCardDesigns'
import type { PersonProfile } from './PersonSelectorModal'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { CheckCircle2, Sparkles, X, Store, Eye, Award } from 'lucide-react-native'

export interface ReleaseModalProps {
  visible: boolean
  design: CardDesign
  person: PersonProfile
  currentUsername?: string | null
  onClose: () => void
}

export function ReleaseModal({
  visible,
  design,
  person,
  currentUsername,
  onClose,
}: ReleaseModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState(design.title || 'Untitled Release')
  const [editionMode, setEditionMode] = useState<CardEditionMode>('LIMITED')
  const [editionSize, setEditionSize] = useState<number>(25)
  const [createdRelease, setCreatedRelease] = useState<CardRelease | null>(null)
  const [claimedIssueNumber, setClaimedIssueNumber] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const createReleaseMutation = useCreateRelease()
  const generateReleaseMutation = useGenerateRelease()
  const publishReleaseMutation = usePublishRelease()
  const claimReleaseMutation = useClaimRelease()

  const isPublishing =
    createReleaseMutation.isPending ||
    generateReleaseMutation.isPending ||
    publishReleaseMutation.isPending

  async function handleCreateAndPublish() {
    setErrorMsg(null)
    try {
      // 1. Create release from exact current design revision
      const requestId = generateStableRequestId('rel')
      const release = await createReleaseMutation.mutateAsync({
        templateId: design.id,
        expectedRevision: design.revision,
        personProfileId: person.id,
        title: title.trim() || design.title,
        editionMode,
        editionSize: editionMode === 'LIMITED' ? editionSize : editionMode === 'ONE_OF_ONE' ? 1 : null,
        requestId,
      })
      setCreatedRelease(release)

      // 2. Generate artwork pipeline
      await generateReleaseMutation.mutateAsync(release.id)

      // 3. Publish release
      const published = await publishReleaseMutation.mutateAsync({
        releaseId: release.id,
        visibility: 'PUBLIC',
      })
      setCreatedRelease(published)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to publish release. Please try again.')
    }
  }

  async function handleClaimIssue() {
    if (!createdRelease) return
    try {
      const issue = await claimReleaseMutation.mutateAsync(createdRelease.id)
      setClaimedIssueNumber(issue.issueNumber ?? 1)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to claim issue.')
    }
  }

  const isPublished = createdRelease?.status === 'PUBLISHED'

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/70">
        <View className="max-h-[90%] rounded-t-3xl border-t border-border bg-surface p-lg">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-md">
            <View>
              <Text className="text-xl font-bold">
                {isPublished ? 'Release Published!' : 'Publish Collectible Release'}
              </Text>
              <Text variant="caption">
                {isPublished
                  ? 'Frozen snapshot published to your creator storefront'
                  : 'Turn this reusable design into an immutable numbered release'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              className="rounded-full p-xs hover:bg-muted-text/10"
            >
              <X size={22} className="text-muted-text" />
            </Pressable>
          </View>

          {errorMsg && (
            <View className="mb-md rounded-xl border border-error/30 bg-error/10 p-md">
              <Text className="text-sm font-semibold text-error">{errorMsg}</Text>
            </View>
          )}

          <ScrollView className="max-h-[75vh]">
            {!isPublished ? (
              <View className="gap-md pb-lg">
                {/* Release Title */}
                <View className="gap-xs">
                  <Text className="font-semibold text-text">Release Title</Text>
                  <Input value={title} onChangeText={setTitle} placeholder="Release Title" />
                </View>

                {/* Subject Summary */}
                <View className="rounded-xl border border-border bg-card-surface p-md">
                  <Text className="text-xs uppercase text-muted-text">Card Subject</Text>
                  <Text className="text-base font-bold text-text">{person.displayName}</Text>
                  {person.bio ? <Text variant="caption">{person.bio}</Text> : null}
                </View>

                {/* Edition Settings */}
                <View className="gap-xs">
                  <Text className="font-semibold text-text">Edition Mode</Text>
                  <View className="flex-row gap-xs">
                    {(['LIMITED', 'ONE_OF_ONE', 'UNLIMITED'] as CardEditionMode[]).map((mode) => (
                      <Pressable
                        key={mode}
                        onPress={() => setEditionMode(mode)}
                        className={`flex-1 items-center rounded-xl border p-sm ${
                          editionMode === mode
                            ? 'border-brand bg-brand/10'
                            : 'border-border bg-card-surface'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            editionMode === mode ? 'text-brand' : 'text-text'
                          }`}
                        >
                          {mode === 'LIMITED' ? 'Limited' : mode === 'ONE_OF_ONE' ? '1 of 1' : 'Unlimited'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {editionMode === 'LIMITED' && (
                  <View className="gap-xs">
                    <Text className="font-semibold text-text">Edition Size</Text>
                    <View className="flex-row items-center gap-xs">
                      {[10, 25, 50, 100, 250].map((size) => (
                        <Pressable
                          key={size}
                          onPress={() => setEditionSize(size)}
                          className={`rounded-lg border px-sm py-xs ${
                            editionSize === size
                              ? 'border-brand bg-brand/10'
                              : 'border-border bg-card-surface'
                          }`}
                        >
                          <Text className="text-xs font-semibold">{size}</Text>
                        </Pressable>
                      ))}
                      <Input
                        className="w-20 text-xs"
                        keyboardType="numeric"
                        value={String(editionSize)}
                        onChangeText={(v) => setEditionSize(Math.max(1, parseInt(v, 10) || 1))}
                      />
                    </View>
                  </View>
                )}

                {/* Provenance note */}
                <View className="rounded-xl border border-border bg-surface p-md">
                  <Text className="text-xs text-muted-text">
                    This captures Design Revision #{design.revision} into an immutable release. Future
                    edits to this design will not alter this release or its numbered copies.
                  </Text>
                </View>

                <Button
                  variant="primary"
                  icon={Sparkles}
                  isLoading={isPublishing}
                  onPress={handleCreateAndPublish}
                >
                  Create & Publish Release
                </Button>
              </View>
            ) : (
              /* Published view: renders templateSnapshot.composition */
              <View className="items-center gap-md pb-lg">
                <View className="items-center gap-xs">
                  <CheckCircle2 size={40} className="text-success" />
                  <Text className="text-xl font-bold text-text">Release is Live!</Text>
                  <Text variant="caption" className="text-center">
                    "{createdRelease?.title}" has been published with independent numbering.
                  </Text>
                </View>

                {/* Shared deterministic renderer using frozen templateSnapshot */}
                {createdRelease?.templateSnapshot?.composition && (
                  <View className="items-center py-xs">
                    <CardCompositionRenderer
                      composition={createdRelease.templateSnapshot.composition}
                      person={createdRelease.person ?? createdRelease.templateSnapshot.person}
                      assets={createdRelease.templateSnapshot.assets}
                      issue={
                        claimedIssueNumber
                          ? {
                              issueNumber: claimedIssueNumber,
                              editionSize: createdRelease.editionSize,
                              editionMode: createdRelease.editionMode,
                            }
                          : null
                      }
                      width={280}
                    />
                  </View>
                )}

                {/* Claim Issue #1 Button */}
                {!claimedIssueNumber ? (
                  <Button
                    variant="primary"
                    icon={Award}
                    isLoading={claimReleaseMutation.isPending}
                    onPress={handleClaimIssue}
                  >
                    Claim Creator Copy (#001)
                  </Button>
                ) : (
                  <Badge tone="verified">
                    {`Claimed Issue #${String(claimedIssueNumber).padStart(3, '0')}`}
                  </Badge>
                )}

                {/* Quick Navigation Links */}
                <View className="w-full flex-row gap-sm pt-sm">
                  {currentUsername && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      icon={Store}
                      onPress={() => {
                        onClose()
                        router.push({
                          pathname: '/storefronts/[username]' as any,
                          params: { username: currentUsername },
                        })
                      }}
                    >
                      View in Storefront
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex-1"
                    icon={Eye}
                    onPress={() => {
                      onClose()
                      router.push({
                        pathname: '/cards/[cardId]',
                        params: { cardId: createdRelease!.id },
                      })
                    }}
                  >
                    View Release
                  </Button>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
