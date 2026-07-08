import { render } from '@testing-library/react-native'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders its children text', async () => {
    const { getByText } = await render(<Badge tone="verified">Verified</Badge>)
    expect(getByText('Verified')).toBeTruthy()
  })

  it('defaults to the muted-text tone when none is given', async () => {
    const { getByText } = await render(<Badge>Default</Badge>)
    expect(getByText('Default')).toBeTruthy()
  })
})
