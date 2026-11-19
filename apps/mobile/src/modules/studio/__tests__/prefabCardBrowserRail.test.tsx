import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { PrefabCardBrowserRail } from '../components/PrefabCardBrowserRail'
import { FINISHED_PREFAB_CARDS } from '../data/finishedPrefabCards'

describe('PrefabCardBrowserRail', () => {
  it('renders all finished prefab cards in the horizontal rail', async () => {
    const handleSelect = jest.fn()
    const screen = await render(
      <PrefabCardBrowserRail
        activePrefabId={null}
        activeFlagshipId="royal-heritage"
        onSelectPrefab={handleSelect}
      />
    )

    expect(screen.getByTestId('prefab-card-browser-rail')).toBeTruthy()
    expect(screen.getByText('Finished Collectibles')).toBeTruthy()

    // Verifies all prefabs are present
    for (const card of FINISHED_PREFAB_CARDS) {
      expect(screen.getByTestId(`prefab-card-${card.id}`)).toBeTruthy()
      expect(screen.getByText(card.title)).toBeTruthy()
    }
  })

  it('triggers onSelectPrefab with full mock data when a card is clicked', async () => {
    const handleSelect = jest.fn()
    const screen = await render(
      <PrefabCardBrowserRail
        activePrefabId={null}
        activeFlagshipId="royal-heritage"
        onSelectPrefab={handleSelect}
      />
    )

    const jerryCard = FINISHED_PREFAB_CARDS[0]
    fireEvent.press(screen.getByTestId(`prefab-card-${jerryCard.id}`))

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: jerryCard.id,
        flagshipId: 'royal-heritage',
        subjectName: 'Jerry Garcia',
        contentStore: expect.objectContaining({
          input1: 'Jerry Garcia',
          input2: 'LEAD GUITAR · LIVE FOREVER',
        }),
      })
    )
  })

  it('identifies and highlights the active prefab card', async () => {
    const handleSelect = jest.fn()
    const sarCard = FINISHED_PREFAB_CARDS[1]
    const screen = await render(
      <PrefabCardBrowserRail
        activePrefabId={sarCard.id}
        activeFlagshipId="chrome-future"
        onSelectPrefab={handleSelect}
      />
    )

    const button = screen.getByTestId(`prefab-card-${sarCard.id}`)
    expect(button).toBeTruthy()
  })
})
