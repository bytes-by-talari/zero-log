import { createLogger } from '../src'
import type { LoggerOptions } from '../src'

// Custom PII masking configuration
const piiConfig: LoggerOptions = {
    name: 'secure-service',
    level: 'info',
    piiMasking: {
        sensitivePaths: [
            'password',
            'token',
            'secret',
            'ssn',
            'creditCard.number',
            'user.email',
            'user.phone',
            'payment.cardNumber',
            'payment.cvv'
        ],
        maskValue: '[REDACTED]',
        partialMasking: true,
        customPatterns: [
            {
                pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
                replacement: '****-****-****-****'
            },
            {
                pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
                replacement: '***-**-****'
            },
            {
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                replacement: '***@***.***'
            }
        ]
    }
}

const logger = createLogger(piiConfig)

// Test PII masking
logger.info('User registration', {
    user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com', // Will be masked to ***@***.***
        password: 'mySecretPassword123', // Will be masked to [REDACTED]
        ssn: '123-45-6789' // Will be masked to ***-**-****
    },
    payment: {
        cardNumber: '4111-1111-1111-1111', // Will be masked to ****-****-****-****
        cvv: '123', // Will be masked to [REDACTED]
        expiry: '12/25' // Will remain unmasked
    },
    metadata: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
    }
})

// Test nested object masking
logger.info('API request', {
    request: {
        headers: {
            authorization: 'Bearer secret-token-123', // Will be masked
            'x-api-key': 'api-key-456' // Will be masked
        },
        body: {
            user: {
                email: 'test@example.com', // Will be masked
                password: 'password123' // Will be masked
            }
        }
    }
})

// Test custom patterns in message
logger.info('Credit card payment processed for card ending in 4111-1111-1111-1111', {
    amount: 99.99,
    currency: 'USD'
})
