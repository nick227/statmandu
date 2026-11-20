import type { ContentStoreInputs } from './designContract'

export interface FixtureSubject {
  id: string
  label: string
  description: string
  imageAssetId: string
  content: ContentStoreInputs
  person?: {
    displayName: string
    bio: string
    hometown?: string
    avatarUrl?: string
  }
}
