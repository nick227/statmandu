import { Platform, Share } from 'react-native'
import * as Linking from 'expo-linking'

export interface PublicSharePayload {
  title: string
  message?: string
  path: string
}

interface ShareDependencies {
  platform: string
  urlForPath: (path: string) => string
  nativeShare: (content: { title: string; message: string; url?: string }) => Promise<unknown>
  webShare?: (content: { title: string; text: string; url: string }) => Promise<unknown>
  copyText?: (text: string) => Promise<unknown>
}

export type PublicShareMethod = 'web-share' | 'clipboard' | 'native-share'

function defaultDependencies(): ShareDependencies {
  const navigator = typeof globalThis.navigator === 'undefined' ? undefined : globalThis.navigator
  return {
    platform: Platform.OS,
    urlForPath: Linking.createURL,
    nativeShare: Share.share,
    webShare: navigator?.share?.bind(navigator),
    copyText: navigator?.clipboard?.writeText.bind(navigator.clipboard),
  }
}

export async function sharePublicEntity(
  payload: PublicSharePayload,
  dependencies: ShareDependencies = defaultDependencies()
): Promise<PublicShareMethod> {
  const url = dependencies.urlForPath(payload.path)
  const text = [payload.title, payload.message].filter(Boolean).join('\n')

  if (dependencies.platform === 'web' && dependencies.webShare) {
    await dependencies.webShare({ title: payload.title, text: payload.message ?? payload.title, url })
    return 'web-share'
  }

  if (dependencies.platform === 'web' && dependencies.copyText) {
    await dependencies.copyText([text, url].join('\n'))
    return 'clipboard'
  }

  await dependencies.nativeShare({ title: payload.title, message: [text, url].join('\n'), url })
  return 'native-share'
}
