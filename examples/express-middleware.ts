import express from 'express'
import { createLogger, createSentryTransport } from '../src'
import type { Logger } from '../src'

// Create logger with Sentry integration
const logger = createLogger({
    name: 'express-api',
    level: 'info',
    piiMasking: {
        sensitivePaths: ['password', 'token', 'authorization', 'cookie'],
        maskValue: '[REDACTED]'
    },
    transports: [
        createSentryTransport({
            dsn: process.env.SENTRY_DSN,
            errorSampleRate: 1.0
        })
    ]
})

const app = express()

// Express middleware to add request context
app.use((req, res, next) => {
    const requestLogger = logger.child({
        requestId: req.headers['x-request-id'] || `req-${Date.now()}`,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip
    })

        // Attach logger to request object
        ; (req as any).logger = requestLogger

    // Log request start
    requestLogger.info('Request started', {
        headers: req.headers,
        query: req.query,
        body: req.body
    })

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function (chunk?: any, encoding?: any) {
        requestLogger.info('Request completed', {
            statusCode: res.statusCode,
            responseTime: Date.now() - (req as any).startTime
        })
        return originalEnd.call(this, chunk, encoding)
    }

        ; (req as any).startTime = Date.now()
    next()
})

// Example routes
app.get('/users/:id', (req, res) => {
    const requestLogger = (req as any).logger as Logger

    requestLogger.info('Fetching user', { userId: req.params.id })

    try {
        // Simulate user fetch
        const user = {
            id: req.params.id,
            email: 'user@example.com', // Will be masked
            name: 'John Doe'
        }

        requestLogger.info('User fetched successfully', { user })
        res.json(user)
    } catch (error) {
        requestLogger.error('Failed to fetch user', {
            error: error as Error,
            userId: req.params.id
        })
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/login', (req, res) => {
    const requestLogger = (req as any).logger as Logger

    const { email, password } = req.body

    requestLogger.info('Login attempt', {
        email, // Will be masked
        password // Will be masked
    })

    // Simulate authentication
    if (email === 'admin@example.com' && password === 'password123') {
        requestLogger.info('Login successful', { email })
        res.json({ token: 'jwt-token-123' })
    } else {
        requestLogger.warn('Login failed', { email })
        res.status(401).json({ error: 'Invalid credentials' })
    }
})

app.listen(3000, () => {
    logger.info('Express server started', { port: 3000 })
})
