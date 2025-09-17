// Core exports
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
    FileTransportOptions,
    Processor,
    Transport
} from './types'

// Processor exports
export { createPIIMaskProcessor } from './processors/pii-mask'
export { createRegexMaskProcessor, commonRegexPatterns } from './processors/regex-mask'
export { createEnrichProcessor, commonEnrichments } from './processors/enrich'

// Transport exports
export { createSentryTransport } from './transports/sentry'
export { createHttpTransport } from './transports/http'

// Re-export Pino for advanced usage
export { default as pino } from 'pino'
