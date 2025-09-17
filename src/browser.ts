// Browser-specific exports
export { createLogger, createDefaultLogger, createProductionLogger } from './core/factory'
export { ZeroLogger } from './core/logger'

// Type exports
export type {
    Logger,
    LoggerOptions,
    LogLevel,
    LogEntry,
    PIIMaskingConfig,
    Timer,
    SentryTransportOptions,
    HttpTransportOptions,
    Processor,
    Transport
} from './types'

// Processor exports
export { createPIIMaskProcessor } from './processors/pii-mask'
export { createRegexMaskProcessor, commonRegexPatterns } from './processors/regex-mask'
export { createEnrichProcessor, commonEnrichments } from './processors/enrich'

// Transport exports (browser-compatible)
export { createSentryTransport } from './transports/sentry'
export { createHttpTransport } from './transports/http'

// Browser-specific Pino configuration
import pino from 'pino'

// Configure Pino for browser environment
export const browserPino = pino({
    browser: {
        asObject: true,
        serialize: true
    }
})
