import { describe, expect, it } from "bun:test"
import { registerShutdownHandlers } from "./keep-alive"

describe("registerShutdownHandlers", () => {
  it("registers SIGINT and SIGTERM cleanup handlers", async () => {
    let cleanupCalls = 0
    const beforeSigint = process.listenerCount("SIGINT")
    const beforeSigterm = process.listenerCount("SIGTERM")

    const unregister = registerShutdownHandlers(
      async () => {
        cleanupCalls += 1
      },
      { exit: false },
    )

    expect(process.listenerCount("SIGINT")).toBe(beforeSigint + 1)
    expect(process.listenerCount("SIGTERM")).toBe(beforeSigterm + 1)

    const sigintHandler = process.listeners("SIGINT").at(-1) as () => Promise<void>
    const sigtermHandler = process.listeners("SIGTERM").at(-1) as () => Promise<void>

    await sigintHandler()
    await sigtermHandler()
    unregister()

    expect(cleanupCalls).toBe(1)
    expect(process.listenerCount("SIGINT")).toBe(beforeSigint)
    expect(process.listenerCount("SIGTERM")).toBe(beforeSigterm)
  })
})
