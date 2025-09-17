import type { LogEntry } from '../types'

export interface EnrichmentConfig {
    /** Static fields to add to every log entry */
    static?: Record<string, unknown>
    /** Dynamic fields computed for each log entry */
    dynamic?: Array<{
        key: string
        fn: (entry: LogEntry) => unknown
    }>
}

/**
 * Enrichment processor to add static and dynamic metadata
 */
export function createEnrichProcessor(config: EnrichmentConfig) {
    return (entry: LogEntry): LogEntry => {
        const enrichedEntry = { ...entry }

        // Add static fields
        if (config.static) {
            enrichedEntry.ctx = { ...enrichedEntry.ctx, ...config.static }
        }

        // Add dynamic fields
        if (config.dynamic) {
            const dynamicFields: Record<string, unknown> = {}
            for (const { key, fn } of config.dynamic) {
                try {
                    dynamicFields[key] = fn(entry)
                } catch (error) {
                    // Silently fail for dynamic enrichment to avoid breaking logging
                    dynamicFields[key] = '[enrichment-error]'
                }
            }
            enrichedEntry.ctx = { ...enrichedEntry.ctx, ...dynamicFields }
        }

        return enrichedEntry
    }
}

/**
 * Common enrichment functions
 */
export const commonEnrichments = {
    timestamp: () => new Date().toISOString(),
    pid: () => process.pid,
    hostname: () => process.env.HOSTNAME || 'unknown',
    serviceVersion: () => process.env.SERVICE_VERSION || 'unknown',
    region: () => process.env.AWS_REGION || process.env.REGION || 'unknown',
    environment: () => process.env.NODE_ENV || 'development'
}
