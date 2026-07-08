import { PrismaClient } from '@prisma/client'
export type {
  ClaimStatus,
  DisputeStatus,
  EntityType,
  FeedItemType,
  GameEventType,
  GameReporterRole,
  UserRole,
  ReactionType,
  ReferenceSourceType,
  SourceStatus,
} from '@prisma/client'

declare global {
  var __db: PrismaClient | undefined
}

export const db = global.__db ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__db = db
}
