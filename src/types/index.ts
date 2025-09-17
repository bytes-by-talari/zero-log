export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LoggerMode = 'production' | 'development' | 'test'

export interface LogEntry {
    ts: string
    level: LogLevel
    msg: string
    name: string
    ctx?: Record<string, unknown>
    attrs?: Record<string, unknown>
}

export interface PIIMaskingConfig {
    /** Field paths to mask (supports nested paths like 'user.password') */
    sensitivePaths?: string[]
    /** Custom mask value (default: '[REDACTED]') */
    maskValue?: string
    /** Enable partial masking (e.g., '1234****' for credit cards) */
    partialMasking?: boolean
    /** Regex patterns for flexible masking */
    regexPatterns?: Array<{
        pattern: RegExp
        replacement: string
        description?: string
    }>
    /** Custom patterns for regex-based masking (deprecated, use regexPatterns) */
    customPatterns?: Array<{
        pattern: RegExp
        replacement: string
    }>
    /** Enable deep object scanning with regex patterns */
    deepScan?: boolean
}

export interface LoggerOptions {
    /** Service/component identifier */
    name: string
    /** Log level threshold */
    level?: LogLevel
    /** Environment mode */
    mode?: LoggerMode
    /** Default context fields attached to every log */
    context?: Record<string, unknown>
    /** PII masking configuration */
    piiMasking?: PIIMaskingConfig
    /** Additional processors to apply */
    processors?: Processor[]
    /** Transports for log output */
    transports?: Transport[]
}

export interface Processor {
    (entry: LogEntry): LogEntry | Promise<LogEntry>
}

export interface Transport {
    (entry: LogEntry): void | Promise<void>
}

export interface Logger {
    trace(msg: string, attrs?: Record<string, unknown>): void
    debug(msg: string, attrs?: Record<string, unknown>): void
    info(msg: string, attrs?: Record<string, unknown>): void
    warn(msg: string, attrs?: Record<string, unknown>): void
    error(msg: string, attrs?: Record<string, unknown> | Error): void
    fatal(msg: string, attrs?: Record<string, unknown> | Error): void

    /** Create a child logger with additional context */
    child(context: Record<string, unknown>): Logger

    /** Execute function with scoped context */
    with<T>(context: Record<string, unknown>, fn: () => T): T

    /** Start a timer */
    time(label: string): Timer

    /** Increment a counter */
    count(name: string, delta?: number, attrs?: Record<string, unknown>): void

    /** Capture and serialize an error */
    capture(error: Error, attrs?: Record<string, unknown>): void

    /** Flush all transports */
    flush(): Promise<void>
}

export interface Timer {
    end(attrs?: Record<string, unknown>): void
}

export interface SentryTransportOptions {
    /** Sentry DSN */
    dsn?: string
    /** Sample rate for error events (0-1) */
    errorSampleRate?: number
    /** Sample rate for breadcrumbs (0-1) */
    breadcrumbSampleRate?: number
    /** Additional context to attach */
    context?: Record<string, unknown>
}

export interface HttpTransportOptions {
    /** HTTP endpoint URL */
    url: string
    /** HTTP headers */
    headers?: Record<string, string>
    /** Batch size for sending logs */
    batchSize?: number
    /** Flush interval in milliseconds */
    flushInterval?: number
}

export interface FileTransportOptions {
    /** File path for logs */
    path: string
    /** Maximum file size before rotation */
    maxSize?: string
    /** Maximum number of files to keep */
    maxFiles?: number
    /** Compression for rotated files */
    compress?: boolean
}
