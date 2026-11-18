import { describe, expect, it, vi } from 'vitest'
import { GenerationExecutor } from '../GenerationExecutor'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => { resolve = done })
  return { promise, resolve }
}

describe('GenerationExecutor', () => {
  it('never exceeds configured concurrency and drain waits for queued work', async () => {
    const executor = new GenerationExecutor(2)
    let running = 0
    let peak = 0
    const gates = Array.from({ length: 4 }, deferred)
    const tasks = gates.map((gate, index) => executor.enqueue(String(index), async () => {
      running += 1
      peak = Math.max(peak, running)
      await gate.promise
      running -= 1
    }))

    await vi.waitFor(() => expect(executor.activeCount()).toBe(2))
    let drained = false
    const drain = executor.drain().then(() => { drained = true })
    gates[0]!.resolve(); gates[1]!.resolve()
    await vi.waitFor(() => expect(executor.queuedCount()).toBe(0))
    expect(drained).toBe(false)
    gates[2]!.resolve(); gates[3]!.resolve()
    await Promise.all(tasks)
    await drain
    expect(peak).toBe(2)
  })

  it('graceful shutdown waits and rejects new work', async () => {
    const executor = new GenerationExecutor(1)
    const gate = deferred()
    const task = executor.enqueue('active', () => gate.promise)
    const shutdown = executor.shutdown(1_000)
    await expect(executor.enqueue('late', async () => {})).rejects.toThrow('shutting down')
    gate.resolve()
    await task
    await expect(shutdown).resolves.toBe(true)
  })

  it('reports a bounded shutdown timeout while retaining rejection handling', async () => {
    const executor = new GenerationExecutor(1)
    const gate = deferred()
    const task = executor.enqueue('active', () => gate.promise)
    await expect(executor.shutdown(1)).resolves.toBe(false)
    gate.resolve()
    await task
  })

  it('propagates real task failures without an unhandled rejection', async () => {
    const executor = new GenerationExecutor(1)
    await expect(executor.enqueue('failed', async () => { throw new Error('provider failed') })).rejects.toThrow('provider failed')
    await executor.drain()
  })
})
