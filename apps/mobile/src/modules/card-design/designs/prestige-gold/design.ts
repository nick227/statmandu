import type { AuthoredDesignContract } from '../../types/designContract'
import { composePrestigeGoldFront } from './front'
import { composePrestigeGoldBack } from './back'
import { FIXTURE_JERRY_GARCIA } from './fixtures'

export const prestigeGoldDesign: AuthoredDesignContract = {
  id: 'prestige-gold',
  name: 'Prestige Gold',
  family: 'Heritage Relic',
  description:
    'Deep obsidian velvet substrate, 24k polished gold leaf filigree, dimensional stamped ivory nameplate, and museum-grade back chronicle.',
  visualTradition: 'Royal Portraiture & Regal Numismatics',
  palette: {
    background: '#07090E',
    surface: '#121620',
    foreground: '#FFFFFF',
    accent: '#D4AF37',
    border: '#F59E0B',
    subtext: '#94A3B8',
    gradientGold: ['#D4AF37', '#FFF3B0', '#F59E0B', '#FFFDF0', '#B45309', '#D4AF37'],
    gradientDark: ['#04060A', '#0D1117', '#161B22', '#080A0E'],
  },
  typography: {
    headlineFont: 'serif',
    bodyFont: 'serif',
    subtextFont: 'sans',
    numberFont: 'mono',
  },
  materials: {
    finish: 'metallic',
    sheenIntensity: 0.9,
    foilRegions: ['outer-gold-frame', 'nameplate-bevel', 'medallion-pill', 'corner-filigree'],
  },
  composeFront: composePrestigeGoldFront,
  composeBack: composePrestigeGoldBack,
  defaultFixture: FIXTURE_JERRY_GARCIA,
}
