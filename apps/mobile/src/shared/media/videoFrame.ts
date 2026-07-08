export type VideoStageFit = 'cover' | 'contain'

/** 16:9 frame centered inside a container. */
export function videoFrameSize(
  containerWidth: number,
  containerHeight: number,
  fit: VideoStageFit,
  aspect = 16 / 9
) {
  if (fit === 'cover') {
    return { width: containerWidth, height: containerHeight }
  }

  const containerAspect = containerWidth / containerHeight
  if (containerAspect > aspect) {
    const height = containerHeight
    return { width: height * aspect, height }
  }

  const width = containerWidth
  return { width, height: width / aspect }
}
