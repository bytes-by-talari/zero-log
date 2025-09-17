# Integration Examples

This document provides real-world examples of integrating zero-log into different types of projects.

## 🚀 Express.js API Server

### Project Structure
```
my-express-api/
├── libs/
│   └── zero-log/          # Git submodule
│       ├── dist/
│       └── package.json
├── src/
│   ├── middleware/
│   │   └── logger.ts
│   ├── routes/
│   │   └── users.ts
│   └── app.ts
├── package.json
└── tsconfig.json
```

### Setup
```bash
# Add zero-log as submodule
git submodule add https://github.com/bytes-by-talari/zero-log.git libs/zero-log
cd libs/zero-log && npm install && npm run build && cd ../..

# Install Pino
npm install pino
```

### Logger Middleware
```typescript
// src/middleware/logger.ts
import { createLogger, commonRegexPatterns } from '../../libs/zero-log/dist/index.js'
import type { Request, Response, NextFunction } from 'express'

export const logger = createLogger({
  name: 'express-api',
  piiMasking: {
    sensitivePaths: ['password', 'token', 'aadhaar', 'pan'],
    regexPatterns: [
      commonRegexPatterns.aadhaar,
      commonRegexPatterns.pan,
      commonRegexPatterns.phoneIndia,
      commonRegexPatterns.email
    ],
    deepScan: true
  }
})

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestLogger = logger.child({
    requestId: req.headers['x-request-id'] || `req-${Date.now()}`,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  })

  // Attach to request
  ;(req as any).logger = requestLogger

  // Log request start
  requestLogger.info('Request started', {
    headers: req.headers,
    query: req.query,
    body: req.body
  })

  // Override res.end to log response
  const originalEnd = res.end
  res.end = function(chunk?: any, encoding?: any) {
    requestLogger.info('Request completed', {
      statusCode: res.statusCode,
      responseTime: Date.now() - (req as any).startTime
    })
    return originalEnd.call(this, chunk, encoding)
  }

  ;(req as any).startTime = Date.now()
  next()
}
```

### Route Usage
```typescript
// src/routes/users.ts
import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

router.post('/users', (req: Request, res: Response) => {
  const logger = (req as any).logger
  
  logger.info('Creating user', {
    user: {
      email: req.body.email, // Will be masked
      phone: req.body.phone, // Will be masked
      aadhaar: req.body.aadhaar // Will be masked
    }
  })

  try {
    // User creation logic
    const user = await createUser(req.body)
    
    logger.info('User created successfully', { userId: user.id })
    res.json(user)
  } catch (error) {
    logger.error('Failed to create user', { error: error.message })
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
```

## ⚛️ React/Next.js Application

### Project Structure
```
my-nextjs-app/
├── lib/
│   └── zero-log/          # Direct copy
│       └── dist/
├── src/
│   ├── utils/
│   │   └── logger.ts
│   ├── components/
│   │   └── ErrorBoundary.tsx
│   └── pages/
│       └── api/
│           └── users.ts
├── package.json
└── next.config.js
```

### Setup
```bash
# Copy zero-log source
git clone https://github.com/bytes-by-talari/zero-log.git temp-zero-log
cp -r temp-zero-log/src ./lib/zero-log
rm -rf temp-zero-log

# Install Pino
npm install pino
```

### Logger Configuration
```typescript
// src/utils/logger.ts
import { createLogger, commonRegexPatterns } from '../../lib/zero-log/dist/browser.js'

export const logger = createLogger({
  name: 'nextjs-app',
  piiMasking: {
    regexPatterns: [
      commonRegexPatterns.email,
      commonRegexPatterns.phoneIndia,
      commonRegexPatterns.aadhaar
    ],
    deepScan: true
  }
})

// Browser-specific logger
export const browserLogger = createLogger({
  name: 'browser-app',
  piiMasking: {
    regexPatterns: [
      commonRegexPatterns.email,
      commonRegexPatterns.phoneIndia
    ]
  }
})
```

### Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react'
import { browserLogger } from '../utils/logger'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    browserLogger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent
    })
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}
```

### API Route
```typescript
// src/pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../../utils/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestLogger = logger.child({
    requestId: req.headers['x-request-id'],
    method: req.method,
    url: req.url
  })

  requestLogger.info('API request received', {
    body: req.body,
    query: req.query
  })

  try {
    // API logic
    const result = await processRequest(req.body)
    
    requestLogger.info('API request completed', { result })
    res.json(result)
  } catch (error) {
    requestLogger.error('API request failed', { error: error.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

## 🐳 Docker Microservice

### Project Structure
```
my-microservice/
├── libs/
│   └── zero-log/          # Git submodule
│       └── dist/
├── src/
│   ├── services/
│   │   └── logger.ts
│   └── index.ts
├── package.json
├── Dockerfile
└── docker-compose.yml
```

### Setup
```bash
# Add zero-log as submodule
git submodule add https://github.com/bytes-by-talari/zero-log.git libs/zero-log
cd libs/zero-log && npm install && npm run build && cd ../..

# Install dependencies
npm install pino
```

### Logger Service
```typescript
// src/services/logger.ts
import { createProductionLogger } from '../../libs/zero-log/dist/index.js'

export const logger = createProductionLogger('microservice', {
  piiMasking: {
    sensitivePaths: [
      'password', 'token', 'aadhaar', 'pan', 'bankAccount'
    ],
    regexPatterns: [
      // All India-specific patterns
    ],
    deepScan: true
  }
})

// Service-specific loggers
export const createServiceLogger = (serviceName: string) => {
  return logger.child({ service: serviceName })
}
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy zero-log submodule
COPY libs/ libs/

# Build zero-log
RUN cd libs/zero-log && npm ci && npm run build

# Copy application code
COPY src/ src/
COPY tsconfig.json ./

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  microservice:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
```

## 🔧 Configuration Management

### Environment-based Configuration
```typescript
// src/config/logger.ts
import { createLogger, createProductionLogger } from '../../libs/zero-log/dist/index.js'

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

export const logger = isProduction
  ? createProductionLogger(process.env.SERVICE_NAME || 'app')
  : createLogger({
      name: process.env.SERVICE_NAME || 'app',
      level: process.env.LOG_LEVEL || 'info',
      piiMasking: {
        regexPatterns: [
          // Development patterns
        ]
      }
    })
```

### Feature Flags
```typescript
// src/utils/logger.ts
import { createLogger } from '../../libs/zero-log/dist/index.js'

const logger = createLogger({
  name: 'app',
  piiMasking: {
    regexPatterns: process.env.ENABLE_PII_MASKING === 'true' ? [
      // PII patterns
    ] : [],
    deepScan: process.env.ENABLE_DEEP_SCAN === 'true'
  }
})
```

## 🧪 Testing Integration

### Jest Setup
```typescript
// src/__tests__/logger.test.ts
import { createLogger } from '../../libs/zero-log/dist/index.js'

describe('Logger Integration', () => {
  let logger: any

  beforeEach(() => {
    logger = createLogger({
      name: 'test',
      piiMasking: {
        regexPatterns: [
          // Test patterns
        ]
      }
    })
  })

  it('should mask PII in logs', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    logger.info('User data', {
      email: 'test@example.com',
      phone: '+91 9876543210'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('***@***.***')
    )
    
    consoleSpy.mockRestore()
  })
})
```

### Integration Tests
```typescript
// src/__tests__/integration.test.ts
import request from 'supertest'
import { app } from '../app'

describe('API Integration', () => {
  it('should log requests with PII masking', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'test@example.com',
        phone: '+91 9876543210'
      })

    expect(response.status).toBe(201)
    // Verify logs contain masked data
  })
})
```

## 📊 Monitoring Integration

### Sentry Integration
```typescript
// src/utils/monitoring.ts
import { createLogger, createSentryTransport } from '../../libs/zero-log/dist/index.js'

export const logger = createLogger({
  name: 'monitored-app',
  transports: [
    createSentryTransport({
      dsn: process.env.SENTRY_DSN,
      errorSampleRate: 1.0,
      breadcrumbSampleRate: 0.1
    })
  ]
})
```

### Custom Transport
```typescript
// src/transports/custom.ts
import type { LogEntry } from '../../libs/zero-log/dist/index.js'

export function createCustomTransport(options: { endpoint: string }) {
  return async (entry: LogEntry) => {
    // Send to custom monitoring service
    await fetch(options.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
  }
}
```

These examples show how to integrate zero-log into various project types and architectures. Choose the method that best fits your project's needs and constraints.
