import { db } from '@statman/db'
import { CardService } from '../services/CardService'

const STALE_JOB_THRESHOLD_MS = 5 * 60 * 1000
const MAX_GENERATION_ATTEMPTS = 3
const SWEEP_INTERVAL_MS = 2 * 60 * 1000

const cardService = new CardService()

// Durability for the fire-and-forget generation calls in
// CardService.generateBatch/generateCard: if the process crashes, restarts,
// or deploys mid-generation, a CardGenerationJob row is left QUEUED/
// PROCESSING forever with nothing to retry it — a card silently stuck on
// "Generating..." forever. This sweep finds those and either retries them
// in place (attempt < max) or gives up cleanly, marking the job and card
// FAILED (attempt >= max), so the review screen shows a real, actionable
// state instead of an infinite spinner.
//
// Deliberately not a real job queue (no Redis/worker process) — this app
// is a single Fastify process on MySQL/Railway. A periodic DB sweep is the
// right amount of durability for that shape; see the plan doc for why a
// full queue wasn't the chosen default.
export async function reconcileStuckGenerationJobs() {
  const staleBefore = new Date(Date.now() - STALE_JOB_THRESHOLD_MS)
  const stuckJobs = await db.cardGenerationJob.findMany({
    where: { status: { in: ['QUEUED', 'PROCESSING'] }, updatedAt: { lt: staleBefore } },
  })

  for (const job of stuckJobs) {
    if (job.attempt >= MAX_GENERATION_ATTEMPTS) {
      // Same conditional-atomic-claim shape as retryGenerationJob below —
      // the where clause repeats the exact status/updatedAt just read, so
      // two instances racing to permanently-fail the same job only have one
      // winner (count === 1); the loser's updateMany matches nothing and
      // skips the card-status bookkeeping instead of double-processing it.
      const claim = await db.cardGenerationJob.updateMany({
        where: { id: job.id, status: { in: ['QUEUED', 'PROCESSING'] }, updatedAt: job.updatedAt },
        data: { status: 'FAILED', error: `Exceeded ${MAX_GENERATION_ATTEMPTS} generation attempts (likely a crash/restart mid-generation)` },
      })
      if (claim.count === 0) continue
      await db.cardRelease.updateMany({ where: { id: job.releaseId, publishedAt: null, status: 'GENERATING' }, data: { status: 'FAILED' } }).catch(() => {})
      continue
    }
    await cardService.retryGenerationJob(job.id)
  }

  if (stuckJobs.length > 0) {
    console.log(`[cardGenerationReconciler] processed ${stuckJobs.length} stuck job(s)`)
  }

  return stuckJobs.length
}

export function startCardGenerationReconciler() {
  reconcileStuckGenerationJobs().catch((err) => console.error('[cardGenerationReconciler] startup sweep failed', err))
  const interval = setInterval(() => {
    reconcileStuckGenerationJobs().catch((err) => console.error('[cardGenerationReconciler] sweep failed', err))
  }, SWEEP_INTERVAL_MS)
  interval.unref()
  return () => clearInterval(interval)
}
