export type VideoStageMode = 'inline' | 'immersive' | 'chrome'

export function videoStageFit(mode: VideoStageMode) {
  return mode === 'immersive' ? 'contain' : 'cover'
}
