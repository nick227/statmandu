import bcrypt from 'bcryptjs'

export const DEVELOPMENT_PASSWORD = 'password123'
export const DAY_MS = 24 * 60 * 60 * 1000

export class SeedClock {
  constructor(readonly referenceDate: Date) {}

  days(offset: number, hourOffset = 0) {
    return new Date(this.referenceDate.getTime() + offset * DAY_MS + hourOffset * 60 * 60 * 1000)
  }

  minutes(offset: number) {
    return new Date(this.referenceDate.getTime() + offset * 60 * 1000)
  }
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function existingOrNewPasswordHash(existingHash: string | null | undefined) {
  return existingHash ?? bcrypt.hash(DEVELOPMENT_PASSWORD, 12)
}

export function assertSeed(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Seed validation failed: ${message}`)
}
