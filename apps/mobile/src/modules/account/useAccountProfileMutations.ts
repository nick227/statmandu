import { useUpdateProfile, useUploadImage } from '@statman/sdk'

/** Keep account mutations behind the feature's SDK boundary. */
export function useAccountProfileMutations() {
  return { updateProfile: useUpdateProfile(), uploadImage: useUploadImage() }
}
