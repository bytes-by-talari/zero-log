import type { LogEntry, HttpTransportOptions } from '../types'

/**
 * HTTP transport for sending logs to external endpoints
 */
export function createHttpTransport(options: HttpTransportOptions) {
    const batchSize = options.batchSize ?? 32
    const flushInterval = options.flushInterval ?? 16
    const batch: LogEntry[] = []
    let flushTimer: NodeJS.Timeout | null = null

    const flush = async () => {
        if (batch.length === 0) return

        const logsToSend = [...batch]
        batch.length = 0

        try {
            const response = await fetch(options.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify({
                    logs: logsToSend,
                    timestamp: new Date().toISOString(),
                    count: logsToSend.length
                })
            })

            if (!response.ok) {
                console.warn(`HTTP transport failed: ${response.status} ${response.statusText}`)
            }
        } catch (error) {
            console.warn('HTTP transport error:', error)
        }
    }

    const scheduleFlush = () => {
        if (flushTimer) return

        flushTimer = setTimeout(() => {
            flush()
            flushTimer = null
        }, flushInterval)
    }

    return async (entry: LogEntry): Promise<void> => {
        batch.push(entry)

        if (batch.length >= batchSize) {
            await flush()
        } else {
            scheduleFlush()
        }
    }
}
