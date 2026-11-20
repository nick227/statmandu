import type {
  CardComposition,
  CardCompositionLayer,
} from '../types/layerSpec'
import type {
  AuthoredDesignContract,
  RenderContext,
} from '../types/designContract'

export interface CompiledCardDesign {
  design: AuthoredDesignContract
  composition: CardComposition
  backComposition: CardComposition
}

export function compileAuthoredDesign(
  design: AuthoredDesignContract,
  context: Partial<RenderContext> = {},
): CompiledCardDesign {
  const fullContext: RenderContext = {
    content: { ...design.defaultFixture.content, ...context.content },
    person: context.person !== undefined ? context.person : design.defaultFixture.person,
    imageAssetId: context.imageAssetId || design.defaultFixture.imageAssetId,
    assets: context.assets || [],
    issue: context.issue || null,
  }

  const frontLayers: CardCompositionLayer[] = design.composeFront(fullContext)
  const backLayers: CardCompositionLayer[] = design.composeBack(fullContext)

  const backComposition: CardComposition = {
    schemaVersion: 1,
    canvas: { width: 600, height: 900 },
    layers: backLayers,
    metadata: {
      rendererVersion: 'rdc-composition-v1',
      flagship: {
        id: `${design.id}-back`,
        parentDesignId: design.id,
        face: 'back',
        contentStore: fullContext.content,
      },
    },
  }

  const composition: CardComposition = {
    schemaVersion: 1,
    canvas: { width: 600, height: 900 },
    layers: frontLayers,
    backComposition,
    metadata: {
      rendererVersion: 'rdc-composition-v1',
      flagship: {
        id: design.id,
        name: design.name,
        family: design.family,
        visualTradition: design.visualTradition,
        inputs: fullContext.content,
        contentStore: fullContext.content,
        profile: fullContext.person,
        appearance: {
          finishEffect: design.materials.finish,
          fontRole: design.typography.headlineFont,
          backgroundColor: design.palette.background,
          accentColor: design.palette.accent,
          borderColor: design.palette.border,
          textColor: design.palette.foreground,
        },
        backComposition,
      },
    },
  }

  // Store backComposition reference in front metadata for studio compatibility
  if (composition.metadata?.flagship) {
    composition.metadata.flagship.backComposition = backComposition
  }

  return {
    design,
    composition,
    backComposition,
  }
}
