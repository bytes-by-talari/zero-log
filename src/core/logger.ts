import pino from 'pino'
import { createRegexMaskProcessor } from '../processors/regex-mask'
import type {
    Logger,
    LoggerOptions,
    LogLevel,
    LogEntry,
    Timer,
    PIIMaskingConfig
} from '../types'

export class ZeroLogger implements Logger {
    private pino: pino.Logger
    private context: Record<string, unknown> = {}
    private counters: Map<string, number> = new Map()
    private timers: Map<string, number> = new Map()
    private regexMaskProcessor?: (entry: LogEntry) => LogEntry

    constructor(options: LoggerOptions) {
        const pinoOptions = this.buildPinoOptions(options)
        this.pino = pino(pinoOptions)
        this.context = options.context || {}

        // Set up regex masking processor if configured
        if (options.piiMasking && (options.piiMasking.regexPatterns || options.piiMasking.customPatterns)) {
            this.regexMaskProcessor = createRegexMaskProcessor(options.piiMasking)
        }
    }

    private buildPinoOptions(options: LoggerOptions): pino.LoggerOptions {
        const pinoOptions: pino.LoggerOptions = {
            name: options.name,
            level: options.level || 'info',
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                level: (label) => ({ level: label })
            }
        }

        // Configure PII masking if specified (only for path-based masking)
        if (options.piiMasking && options.piiMasking.sensitivePaths && options.piiMasking.sensitivePaths.length > 0) {
            pinoOptions.serializers = this.createPIIMaskingSerializers(options.piiMasking)
        }

        return pinoOptions
    }

    private createPIIMaskingSerializers(config: PIIMaskingConfig) {
        const maskValue = config.maskValue || '[REDACTED]'
        const sensitivePaths = config.sensitivePaths || []

        // Create custom serializers for path-based masking
        const serializers: Record<string, (value: any) => any> = {}

        for (const path of sensitivePaths) {
            const keys = path.split('.')
            if (keys.length === 1) {
                // Simple key masking
                const key = keys[0]
                if (key) {
                    serializers[key] = () => maskValue
                }
            } else {
                // Nested key masking - we'll handle this in the regex processor
                // For now, just add the top-level key
                const key = keys[0]
                if (key) {
                    serializers[key] = (value: any) => {
                        if (value && typeof value === 'object') {
                            return this.maskNestedObject(value, keys.slice(1), maskValue)
                        }
                        return value
                    }
                }
            }
        }

        return serializers
    }

    private maskNestedObject(obj: any, keys: string[], maskValue: string): any {
        if (keys.length === 0) return maskValue

        const [currentKey, ...remainingKeys] = keys
        if (!currentKey) return obj

        const result = { ...obj }

        if (remainingKeys.length === 0) {
            result[currentKey] = maskValue
        } else if (result[currentKey] && typeof result[currentKey] === 'object') {
            result[currentKey] = this.maskNestedObject(result[currentKey], remainingKeys, maskValue)
        }

        return result
    }

    trace(msg: string, attrs?: Record<string, unknown>): void {
        this.log('trace', msg, attrs)
    }

    debug(msg: string, attrs?: Record<string, unknown>): void {
        this.log('debug', msg, attrs)
    }

    info(msg: string, attrs?: Record<string, unknown>): void {
        this.log('info', msg, attrs)
    }

    warn(msg: string, attrs?: Record<string, unknown>): void {
        this.log('warn', msg, attrs)
    }

    error(msg: string, attrs?: Record<string, unknown> | Error): void {
        if (attrs instanceof Error) {
            this.pino.error({ err: attrs }, msg)
        } else {
            this.log('error', msg, attrs)
        }
    }

    fatal(msg: string, attrs?: Record<string, unknown> | Error): void {
        if (attrs instanceof Error) {
            this.pino.fatal({ err: attrs }, msg)
        } else {
            this.log('fatal', msg, attrs)
        }
    }

    private log(level: LogLevel, msg: string, attrs?: Record<string, unknown>): void {
        let logData = {
            ...this.context,
            ...attrs
        }

        // Apply regex masking if configured
        if (this.regexMaskProcessor) {
            const logEntry: LogEntry = {
                ts: new Date().toISOString(),
                level,
                msg,
                name: this.pino.bindings().name || 'zero-log',
                ctx: this.context,
                attrs: attrs || {}
            }

            const maskedEntry = this.regexMaskProcessor(logEntry)
            logData = {
                ...maskedEntry.ctx,
                ...maskedEntry.attrs
            }
            // Use the masked message
            msg = maskedEntry.msg
        }

        switch (level) {
            case 'trace':
                this.pino.trace(logData, msg)
                break
            case 'debug':
                this.pino.debug(logData, msg)
                break
            case 'info':
                this.pino.info(logData, msg)
                break
            case 'warn':
                this.pino.warn(logData, msg)
                break
            case 'error':
                this.pino.error(logData, msg)
                break
            case 'fatal':
                this.pino.fatal(logData, msg)
                break
        }
    }

    child(context: Record<string, unknown>): Logger {
        const childPino = this.pino.child(context)
        const childLogger = new ZeroLogger({ name: this.pino.bindings().name || 'zero-log' })
        childLogger.pino = childPino
        childLogger.context = { ...this.context, ...context }
        childLogger.counters = this.counters
        childLogger.timers = this.timers
        return childLogger
    }

    with<T>(context: Record<string, unknown>, fn: () => T): T {
        const originalContext = this.context
        this.context = { ...this.context, ...context }
        try {
            return fn()
        } finally {
            this.context = originalContext
        }
    }

    time(label: string): Timer {
        const startTime = Date.now()
        this.timers.set(label, startTime)

        return {
            end: (attrs?: Record<string, unknown>) => {
                const endTime = Date.now()
                const duration = endTime - startTime
                this.timers.delete(label)
                this.info(`Timer ${label} completed`, {
                    ...attrs,
                    duration_ms: duration
                })
            }
        }
    }

    count(name: string, delta: number = 1, attrs?: Record<string, unknown>): void {
        const currentCount = this.counters.get(name) || 0
        const newCount = currentCount + delta
        this.counters.set(name, newCount)
        this.info(`Counter ${name}`, {
            ...attrs,
            count: newCount,
            delta
        })
    }

    capture(error: Error, attrs?: Record<string, unknown>): void {
        this.error('Captured error', {
            ...attrs,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: (error as any).cause
            }
        })
    }

    async flush(): Promise<void> {
        // Pino handles flushing automatically, but we can add custom flush logic here
        return Promise.resolve()
    }
}
