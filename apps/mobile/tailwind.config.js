/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Single source of truth: statman_project_docs/statman_docs_bundle/19_DESIGN_TOKEN_SHEET.json
      // Colors read the CSS variables in global.css so `.dark` swaps every value at once.
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'muted-text': 'rgb(var(--color-muted-text) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        live: 'rgb(var(--color-live) / <alpha-value>)',
        verified: 'rgb(var(--color-verified) / <alpha-value>)',
        dispute: 'rgb(var(--color-dispute) / <alpha-value>)',
        imported: 'rgb(var(--color-imported) / <alpha-value>)',
        // Per-sport accent, scoped via useSportTheme()'s vars() — falls back
        // to brand blue outside any sport context (see global.css).
        'sport-accent': 'rgb(var(--color-sport-accent) / <alpha-value>)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        pill: '9999px',
      },
      fontSize: {
        'entity-name': ['36px', { lineHeight: '40px', fontWeight: '700' }],
        'stat-value': ['32px', { lineHeight: '36px', fontWeight: '700' }],
        'stat-label': ['11px', { lineHeight: '14px', letterSpacing: '0.6px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px' }],
      },
    },
  },
  plugins: [],
}
