import { sharePublicEntity } from '../sharePublicEntity'

const payload = { title: 'Avery Johnson', message: 'Statman athlete profile', path: '/players/player-1' }

describe('sharePublicEntity', () => {
  it('uses the browser share sheet when available', async () => {
    const webShare = jest.fn(async () => {})
    const method = await sharePublicEntity(payload, {
      platform: 'web',
      urlForPath: (path) => `https://statman.example${path}`,
      nativeShare: jest.fn(async () => {}),
      webShare,
    })

    expect(method).toBe('web-share')
    expect(webShare).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://statman.example/players/player-1' }))
  })

  it('copies a public URL when browser sharing is unavailable', async () => {
    const copyText = jest.fn(async () => {})
    const method = await sharePublicEntity(payload, {
      platform: 'web',
      urlForPath: (path) => `https://statman.example${path}`,
      nativeShare: jest.fn(async () => {}),
      copyText,
    })

    expect(method).toBe('clipboard')
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining('https://statman.example/players/player-1'))
  })

  it('uses native sharing on mobile', async () => {
    const nativeShare = jest.fn(async () => {})
    expect(await sharePublicEntity(payload, {
      platform: 'ios',
      urlForPath: (path) => `statman://${path}`,
      nativeShare,
    })).toBe('native-share')
    expect(nativeShare).toHaveBeenCalledTimes(1)
  })
})
