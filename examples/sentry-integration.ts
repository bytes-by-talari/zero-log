import { createLogger, createSentryTransport } from '../src'
import type { LoggerOptions } from '../src'

// Logger with Sentry integration
const loggerOptions: LoggerOptions = {
    name: 'api-service',
    level: 'info',
    piiMasking: {
        sensitivePaths: ['password', 'token', 'email', 'ssn'],
        maskValue: '[REDACTED]'
    },
    transports: [
        createSentryTransport({
            dsn: process.env.SENTRY_DSN,
            errorSampleRate: 1.0, // Send all errors to Sentry
            breadcrumbSampleRate: 0.1, // Send 10% of logs as breadcrumbs
            context: {
                service: 'api-service',
                version: '1.0.0'
            }
        })
    ]
}

const logger = createLogger(loggerOptions)

// These will be sent to Sentry as breadcrumbs
logger.info('User authenticated', { userId: '123' })
logger.info('Database query executed', { query: 'SELECT * FROM users' })

// This will be sent to Sentry as an error event
logger.error('Payment processing failed', {
    error: new Error('Insufficient funds'),
    userId: '123',
    amount: 100.00,
    paymentMethod: 'card'
})

// This will be sent to Sentry as a fatal event
logger.fatal('System shutdown', {
    error: new Error('Out of memory'),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
})

// Using child logger for request context
const requestLogger = logger.child({
    requestId: 'req-456',
    userId: '789'
})

requestLogger.info('Processing payment', { amount: 50.00 })
requestLogger.error('Payment validation failed', {
    error: new Error('Invalid card number'),
    cardNumber: '4111-1111-1111-1111' // Will be masked before sending to Sentry
})
