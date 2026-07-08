import { cn } from '../utils'

describe('cn', () => {
  it('joins plain class strings', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('drops falsy values', () => {
    expect(cn('flex', false, undefined, null, '')).toBe('flex')
  })

  it('lets a later conflicting Tailwind class win, not just concatenate', () => {
    // tailwind-merge should resolve this to a single padding value, not "p-2 p-4"
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('preserves non-conflicting classes alongside a resolved conflict', () => {
    expect(cn('flex-1 text-sm', 'text-lg')).toBe('flex-1 text-lg')
  })
})
