export type GenerationTask = () => Promise<void>

interface QueuedTask {
  id: string
  run: GenerationTask
  resolve: () => void
  reject: (error: unknown) => void
}

/** Small in-process owner for persisted generation jobs. Persistence and
 * stale-job recovery remain in CardService/reconciler; this class owns only
 * bounded execution and process lifecycle. */
export class GenerationExecutor {
  private readonly queue: QueuedTask[] = []
  private readonly active = new Map<string, Promise<void>>()
  private readonly drainWaiters = new Set<() => void>()
  private accepting = true

  constructor(private readonly concurrency = 2) {
    if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Generation concurrency must be a positive integer')
  }

  enqueue(id: string, run: GenerationTask): Promise<void> {
    if (!this.accepting) return Promise.reject(new Error('Generation executor is shutting down'))
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ id, run, resolve, reject })
      this.pump()
    })
  }

  activeCount() {
    return this.active.size
  }

  queuedCount() {
    return this.queue.length
  }

  drain(): Promise<void> {
    if (this.active.size === 0 && this.queue.length === 0) return Promise.resolve()
    return new Promise((resolve) => this.drainWaiters.add(resolve))
  }

  async shutdown(timeoutMs = 15_000): Promise<boolean> {
    this.accepting = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const timedOut = new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs)
      timer.unref?.()
    })
    const drained = this.drain().then(() => true as const)
    const result = await Promise.race([drained, timedOut])
    if (timer) clearTimeout(timer)
    return result
  }

  private pump() {
    while (this.active.size < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!
      const promise = Promise.resolve()
        .then(task.run)
        .then(task.resolve, task.reject)
        .finally(() => {
          this.active.delete(task.id)
          this.pump()
          this.resolveDrainIfIdle()
        })
      this.active.set(task.id, promise)
    }
  }

  private resolveDrainIfIdle() {
    if (this.active.size > 0 || this.queue.length > 0) return
    for (const resolve of this.drainWaiters) resolve()
    this.drainWaiters.clear()
  }
}

export const cardGenerationExecutor = new GenerationExecutor(
  Number(process.env.CARD_GENERATION_CONCURRENCY ?? 2)
)
