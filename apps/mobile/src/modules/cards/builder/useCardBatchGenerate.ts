import { ApiError, useGenerateCardBatch } from '@statman/sdk'

export function useCardBatchGenerate() {
  const generateBatch = useGenerateCardBatch()

  async function generate(input: { athleteProfileId: string; sourceImageAssetId: string; poseIds: string[]; batchRequestId: string }) {
    const result = await generateBatch.mutateAsync(input)
    return result.data
  }

  // The server already returns a clear, user-facing message for both
  // rate-limit (429) cases ("wait a few minutes" / "too many already
  // generating") — surface that directly instead of a generic fallback.
  const errorMessage = generateBatch.error instanceof ApiError
    ? generateBatch.error.message
    : generateBatch.isError
      ? 'Card generation couldn\'t be started. Try again.'
      : null

  return {
    generate,
    isPending: generateBatch.isPending,
    isError: generateBatch.isError,
    errorMessage,
  }
}
