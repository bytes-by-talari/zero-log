import { createLogger, commonRegexPatterns } from '../src'
import type { LoggerOptions } from '../src'

// Advanced regex-based PII masking configuration
const regexConfig: LoggerOptions = {
    name: 'advanced-service',
    level: 'info',
    piiMasking: {
        // Optional: still support path-based masking
        sensitivePaths: [
            'password',
            'token',
            'secret'
        ],
        maskValue: '[REDACTED]',

        // Enhanced regex patterns for comprehensive masking
        regexPatterns: [
            // Built-in common patterns
            commonRegexPatterns.email,
            commonRegexPatterns.creditCard,
            commonRegexPatterns.ssn,
            commonRegexPatterns.phone,
            commonRegexPatterns.ipv4,
            commonRegexPatterns.apiKey,
            commonRegexPatterns.jwt,
            commonRegexPatterns.password,

            // Custom patterns for specific use cases
            {
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                replacement: '***@***.***',
                description: 'Email addresses (custom)'
            },
            {
                pattern: /\b(?:password|passwd|pwd|secret|key)\s*[:=]\s*[^\s,}]+/gi,
                replacement: '$1=***REDACTED***',
                description: 'Password-like fields'
            },
            {
                pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
                replacement: '***.***.***.***',
                description: 'IP addresses (simple)'
            },
            {
                pattern: /\b[A-Za-z0-9]{32,}\b/g,
                replacement: '***HASH***',
                description: 'Long alphanumeric strings (likely hashes)'
            },
            {
                pattern: /\b(?:Bearer|Token|API-Key)\s+[A-Za-z0-9._-]+/gi,
                replacement: '$1 ***REDACTED***',
                description: 'Authorization headers'
            }
        ],

        // Enable deep scanning for nested objects and arrays
        deepScan: true
    }
}

const logger = createLogger(regexConfig)

// Test various PII patterns
logger.info('User registration with comprehensive data', {
    user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com', // Will be masked by regex
        password: 'mySecretPassword123', // Will be masked by regex
        ssn: '123-45-6789', // Will be masked by regex
        phone: '+1-555-123-4567' // Will be masked by regex
    },
    payment: {
        cardNumber: '4111-1111-1111-1111', // Will be masked by regex
        cvv: '123',
        expiry: '12/25'
    },
    technical: {
        ip: '192.168.1.100', // Will be masked by regex
        userAgent: 'Mozilla/5.0...',
        apiKey: 'sk-1234567890abcdef1234567890abcdef', // Will be masked by regex
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Will be masked by regex
    },
    metadata: {
        hash: 'a1b2c3d4e5f6789012345678901234567890abcd', // Will be masked by regex
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Will be masked by regex
    }
})

// Test nested arrays and objects
logger.info('Batch processing with sensitive data', {
    users: [
        {
            email: 'user1@example.com', // Will be masked
            password: 'password123', // Will be masked
            phone: '555-123-4567' // Will be masked
        },
        {
            email: 'user2@example.com', // Will be masked
            password: 'password456', // Will be masked
            phone: '555-987-6543' // Will be masked
        }
    ],
    config: {
        database: {
            connectionString: 'postgresql://user:password@localhost:5432/db', // Will be masked
            apiKey: 'db-api-key-123456789' // Will be masked
        }
    }
})

// Test message-level masking
logger.info('Processing payment for card ending in 4111-1111-1111-1111 and email user@example.com', {
    amount: 99.99,
    currency: 'USD'
})

// Test with different data types
logger.info('Mixed data types with PII', {
    stringData: 'Contact us at support@example.com or call 555-123-4567',
    numberData: 12345,
    booleanData: true,
    arrayData: ['item1', 'user@test.com', 'item3'], // Email will be masked
    objectData: {
        nested: {
            email: 'nested@example.com', // Will be masked
            value: 'normal value'
        }
    }
})

// Test error logging with PII
logger.error('Authentication failed', {
    error: new Error('Invalid credentials'),
    user: {
        email: 'admin@example.com', // Will be masked
        password: 'wrongpassword' // Will be masked
    },
    ip: '192.168.1.50', // Will be masked
    timestamp: new Date().toISOString()
})
