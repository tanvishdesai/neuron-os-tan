type Cleanup = () => void | Promise<void>

interface ShutdownHandlerOptions {
  exit?: boolean
  exitCode?: number
}

export function registerShutdownHandlers(cleanup: Cleanup, options: ShutdownHandlerOptions = {}): () => void {
  const { exit = true, exitCode = 0 } = options
  let shuttingDown = false

  const handleSignal = async () => {
    if (shuttingDown) return
    shuttingDown = true

    try {
      await cleanup()
      if (exit) process.exit(exitCode)
    } catch {
      if (exit) process.exit(1)
    }
  }

  process.on("SIGINT", handleSignal)
  process.on("SIGTERM", handleSignal)

  return () => {
    process.off("SIGINT", handleSignal)
    process.off("SIGTERM", handleSignal)
  }
}

export async function keepAlive(cleanup: Cleanup): Promise<never> {
  registerShutdownHandlers(cleanup)
  await new Promise<never>(() => {})
}
