import React from 'react'
import { render, screen } from '@testing-library/react-native'
import {
  CardCompositionRenderer,
  resolvePersonField,
  resolveLayerText,
  resolveAssetUrl,
} from '../CardCompositionRenderer'

jest.mock('@/shared/media/SmartImage', () => ({
  SmartImage: ({ uri, className }: { uri: string; className: string }) => {
    const { View, Text } = require('react-native')
    return (
      <View testID="mock-smart-image" className={className}>
        <Text>{uri}</Text>
      </View>
    )
  },
}))

describe('CardCompositionRenderer', () => {
  const samplePerson = {
    displayName: 'Elena Vance',
    bio: 'Pianist and Sound Designer',
    hometown: 'Chicago, IL',
  }

  const sampleComposition = {
    schemaVersion: 1 as const,
    canvas: { width: 600, height: 900 },
    layers: [
      {
        id: 'bg-rect',
        type: 'RECTANGLE' as const,
        x: 0,
        y: 0,
        width: 600,
        height: 900,
        fill: '#18181b',
      },
      {
        id: 'portrait-img',
        type: 'IMAGE' as const,
        x: 40,
        y: 60,
        width: 520,
        height: 600,
        imageAssetId: 'asset-123',
      },
      {
        id: 'name-text',
        type: 'TEXT' as const,
        x: 40,
        y: 700,
        width: 520,
        height: 80,
        personField: 'displayName' as const,
        fontSize: 32,
        fill: '#ffffff',
      },
      {
        id: 'bio-text',
        type: 'TEXT' as const,
        x: 40,
        y: 790,
        width: 520,
        height: 60,
        personField: 'bio' as const,
        fontSize: 18,
        fill: '#94a3b8',
      },
      {
        id: 'custom-text',
        type: 'TEXT' as const,
        x: 40,
        y: 850,
        width: 520,
        height: 40,
        text: 'Limited First Edition',
        fontSize: 14,
        fill: '#fbbf24',
      },
    ],
  }

  it('resolves personField bindings correctly', () => {
    expect(resolvePersonField('displayName', samplePerson)).toBe('Elena Vance')
    expect(resolvePersonField('bio', samplePerson)).toBe('Pianist and Sound Designer')
    expect(resolvePersonField('hometown', samplePerson)).toBe('Chicago, IL')
    expect(resolvePersonField(undefined, samplePerson)).toBe('')
    expect(resolvePersonField('displayName', null)).toBe('')
  })

  it('resolves layer text between literal text and person bindings', () => {
    expect(
      resolveLayerText(
        { id: '1', type: 'TEXT', x: 0, y: 0, width: 100, height: 50, text: 'Literal Text' },
        samplePerson,
      ),
    ).toBe('Literal Text')

    expect(
      resolveLayerText(
        { id: '2', type: 'TEXT', x: 0, y: 0, width: 100, height: 50, personField: 'displayName' },
        samplePerson,
      ),
    ).toBe('Elena Vance')
  })

  it('resolves asset URLs from asset manifests and fallback paths', () => {
    const assets = [
      { id: 'asset-123', url: 'https://cdn.example.com/portraits/elena.png' },
    ]
    expect(resolveAssetUrl('asset-123', assets)).toBe('https://cdn.example.com/portraits/elena.png')
    expect(resolveAssetUrl('https://direct.url/photo.jpg', assets)).toBe('https://direct.url/photo.jpg')
    expect(resolveAssetUrl('asset-456', assets)).toBe('/uploads/images/asset-456')
    expect(resolveAssetUrl(undefined, assets)).toBeNull()
  })

  it('renders all layers in deterministic order', async () => {
    const screen = await render(
      <CardCompositionRenderer
        composition={sampleComposition}
        person={samplePerson}
        assets={[{ id: 'asset-123', url: 'https://cdn.example.com/portraits/elena.png' }]}
        width={300}
      />,
    )

    expect(screen.getByTestId('layer-rect-bg-rect')).toBeTruthy()
    expect(screen.getByTestId('layer-img-portrait-img')).toBeTruthy()
    expect(screen.getByTestId('layer-text-name-text')).toBeTruthy()
    expect(screen.getByTestId('layer-text-bio-text')).toBeTruthy()
    expect(screen.getByTestId('layer-text-custom-text')).toBeTruthy()

    expect(screen.getByText('Elena Vance')).toBeTruthy()
    expect(screen.getByText('Pianist and Sound Designer')).toBeTruthy()
    expect(screen.getByText('Limited First Edition')).toBeTruthy()
  })

  it('renders authentic issue badge only when an authentic issue is provided', async () => {
    const screen = await render(
      <CardCompositionRenderer
        composition={sampleComposition}
        person={samplePerson}
        issue={{
          issueNumber: 7,
          editionSize: 50,
          editionMode: 'LIMITED',
        }}
        width={300}
      />,
    )

    expect(screen.getByTestId('authentic-issue-badge')).toBeTruthy()
    expect(screen.getByText('#007 / 050')).toBeTruthy()
    expect(screen.queryByTestId('unissued-preview-indicator')).toBeNull()

    // Without issue, no authentic issue badge
    await screen.rerender(
      <CardCompositionRenderer
        composition={sampleComposition}
        person={samplePerson}
        issue={null}
        width={300}
        isPreview={true}
      />,
    )

    expect(screen.queryByTestId('authentic-issue-badge')).toBeNull()
    expect(screen.getByTestId('unissued-preview-indicator')).toBeTruthy()
    expect(screen.getByText('PREVIEW · UNISSUED')).toBeTruthy()
  })
})
