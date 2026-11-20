import type { AuthoredDesignContract } from '../types/designContract'
import { prestigeGoldDesign } from '../designs/prestige-gold/design'

class DesignRegistry {
  private designs = new Map<string, AuthoredDesignContract>()

  constructor() {
    this.register(prestigeGoldDesign)
    // Alias royal-heritage to prestigeGoldDesign for full backward compatibility
    this.register({
      ...prestigeGoldDesign,
      id: 'royal-heritage',
      name: 'Royal Heritage · Prestige Gold',
    })
  }

  register(design: AuthoredDesignContract) {
    this.designs.set(design.id, design)
  }

  get(id: string): AuthoredDesignContract | undefined {
    return this.designs.get(id)
  }

  getAll(): AuthoredDesignContract[] {
    return Array.from(this.designs.values())
  }
}

export const designRegistry = new DesignRegistry()
