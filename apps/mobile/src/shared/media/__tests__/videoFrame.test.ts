import { videoFrameSize } from '@/shared/media/videoFrame'

describe('videoFrameSize', () => {
  it('letterboxes wide containers in contain mode', () => {
    const frame = videoFrameSize(400, 300, 'contain')
    expect(frame.width).toBe(400)
    expect(frame.height).toBeCloseTo(400 / (16 / 9))
  })

  it('fills container in cover mode', () => {
    expect(videoFrameSize(320, 180, 'cover')).toEqual({ width: 320, height: 180 })
  })
})
