import { createLogger, createDefaultLogger, createProductionLogger } from '../src'

// Basic usage with default PII masking
const logger = createDefaultLogger('my-service')

logger.info('Service started', {
    port: 3000,
    environment: 'development'
})

// Log with sensitive data (will be masked)
logger.info('User login', {
    user: {
        id: '123',
        email: 'user@example.com', // This will be masked
        password: 'secret123' // This will be masked
    },
    ip: '192.168.1.1' // This will be masked
})

// Error logging
logger.error('Database connection failed', {
    error: new Error('Connection timeout'),
    database: 'postgres',
    host: 'localhost'
})

// Using timers
const timer = logger.time('database-query')
// ... some async operation
timer.end({ query: 'SELECT * FROM users' })

// Using counters
logger.count('api-requests', 1, { endpoint: '/users' })
logger.count('api-requests', 1, { endpoint: '/posts' })

// Child logger with additional context
const requestLogger = logger.child({ requestId: 'req-123' })
requestLogger.info('Processing request', { userId: '456' })
