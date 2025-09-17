# zero-log

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pino](https://img.shields.io/badge/Pino-FF6B6B?style=for-the-badge&logo=node.js&logoColor=white)](https://github.com/pinojs/pino)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)]()

**A high-performance, TypeScript-first logging library built on Pino with advanced PII masking capabilities**

*Built for Indian applications with comprehensive data protection*

</div>

---

## 🚀 Features

- ⚡ **Ultra-Fast Performance** - Built on Pino's lightning-fast JSON logging engine
- 🔒 **Advanced PII Protection** - Comprehensive masking for Indian & international data
- 🇮🇳 **India-Specific Patterns** - Aadhaar, PAN, IFSC, UPI, vehicle numbers, and more
- 📊 **Structured Logging** - JSON-first with human-readable development mode
- 🔧 **Highly Extensible** - Pluggable processors and transports
- 🐛 **Error Reporting** - Seamless Sentry integration
- 🎯 **Context-Aware** - Child loggers with request/user correlation
- 📱 **Universal** - Works in Node.js and browsers
- 🛡️ **Type-Safe** - Full TypeScript support with IntelliSense

## 📦 Installation

### Option 1: NPM (Recommended)
```bash
npm install zero-log
```

### Option 2: GitHub Repository
```bash
npm install git+https://github.com/bytes-by-talari/zero-log.git
```

### Option 3: Direct Integration (No NPM)

#### Method A: Git Submodule
```bash
# Add as submodule
git submodule add https://github.com/bytes-by-talari/zero-log.git libs/zero-log

# Install dependencies
cd libs/zero-log
npm install
npm run build
cd ../..

# Install Pino (required dependency)
npm install pino
```

#### Method B: Direct Copy
```bash
# Clone the repository
git clone https://github.com/bytes-by-talari/zero-log.git

# Copy source files to your project
cp -r zero-log/src ./libs/zero-log

# Add to your package.json dependencies
npm install pino
```

#### Method C: Manual Build Integration
1. Download the `src` folder from this repository
2. Add to your project structure: `libs/zero-log/`
3. Install Pino: `npm install pino`
4. Import directly: `import { createLogger } from './libs/zero-log'`

> 📖 **Detailed Integration Guide**: See [INTEGRATION.md](INTEGRATION.md) for comprehensive examples

## 🚀 Quick Start

```typescript
import { createDefaultLogger } from 'zero-log'

const logger = createDefaultLogger('my-service')

// Basic logging
logger.info('Service started', { port: 3000 })

// PII masking is automatic
logger.info('User login', {
  user: {
    email: 'user@example.com', // → ***@***.***
    phone: '+91 9876543210'    // → **********
  }
})
```

## 🇮🇳 India-Specific PII Masking

zero-log provides comprehensive protection for Indian PII data:

```typescript
import { createProductionLogger } from 'zero-log'

const logger = createProductionLogger('india-app')

logger.info('KYC verification', {
  user: {
    aadhaar: '1234 5678 9012',    // → ****-****-****
    pan: 'ABCDE1234F',            // → *****####*
    phone: '+91 9876543210',      // → **********
    email: 'user@example.com'     // → ***@***.***
  },
  bank: {
    accountNumber: '1234567890123456', // → ****-****-****-****
    ifsc: 'SBIN0001234',               // → ****0******
    upi: 'user@paytm'                  // → ***@***
  },
  vehicle: {
    number: 'KA01 AB 1234',        // → ** ** ** ****
    ownerLicense: 'KA0120141234567' // → **##****#######
  }
})
```

### Supported India-Specific Patterns

| Pattern | Example | Masked Output | Description |
|---------|---------|---------------|-------------|
| **Aadhaar** | `1234 5678 9012` | `****-****-****` | 12-digit Aadhaar numbers |
| **PAN** | `ABCDE1234F` | `*****####*` | 10-character PAN numbers |
| **Phone** | `+91 9876543210` | `**********` | Indian mobile numbers |
| **Bank Account** | `1234567890123456` | `****-****-****-****` | Bank account numbers |
| **IFSC** | `SBIN0001234` | `****0******` | IFSC codes |
| **UPI** | `user@paytm` | `***@***` | UPI IDs |
| **Vehicle** | `KA01 AB 1234` | `** ** ** ****` | Vehicle registration |
| **Driving License** | `KA0120141234567` | `**##****#######` | Driving license numbers |
| **Passport** | `A1234567` | `*#######` | Passport numbers |

## 🔧 Advanced Configuration

### Custom PII Masking

```typescript
import { createLogger, commonRegexPatterns } from 'zero-log'

const logger = createLogger({
  name: 'secure-service',
  piiMasking: {
    // Path-based masking
    sensitivePaths: ['password', 'token', 'aadhaar', 'pan'],
    
    // Regex patterns
    regexPatterns: [
      commonRegexPatterns.aadhaar,
      commonRegexPatterns.pan,
      commonRegexPatterns.phoneIndia,
      // Custom patterns
      {
        pattern: /\b[A-Z]{2}\d{2}[A-Z]{2}\d{4}\b/g,
        replacement: '**##**####',
        description: 'Custom ID pattern'
      }
    ],
    deepScan: true, // Scan nested objects
    maskValue: '[REDACTED]'
  }
})
```

### Sentry Integration

```typescript
import { createLogger, createSentryTransport } from 'zero-log'

const logger = createLogger({
  name: 'api-service',
  transports: [
    createSentryTransport({
      dsn: process.env.SENTRY_DSN,
      errorSampleRate: 1.0,
      breadcrumbSampleRate: 0.1
    })
  ]
})
```

### Context Management

```typescript
// Child logger with additional context
const requestLogger = logger.child({ 
  requestId: 'req-123',
  userId: '456' 
})

// Scoped context
logger.with({ userId: '789' }, () => {
  logger.info('Processing user action')
})
```

### Timers and Counters

```typescript
// Timer
const timer = logger.time('database-query')
// ... async operation
timer.end({ query: 'SELECT * FROM users' })

// Counter
logger.count('api-requests', 1, { endpoint: '/users' })
```

## 🏗️ Real-World Examples

### Express.js Middleware

```typescript
import express from 'express'
import { createLogger } from 'zero-log'

const logger = createLogger({
  name: 'express-api',
  piiMasking: {
    regexPatterns: [commonRegexPatterns.aadhaar, commonRegexPatterns.pan]
  }
})

const app = express()

app.use((req, res, next) => {
  const requestLogger = logger.child({
    requestId: req.headers['x-request-id'],
    method: req.method,
    url: req.url
  })
  
  req.logger = requestLogger
  next()
})

app.get('/users/:id', (req, res) => {
  req.logger.info('Fetching user', { userId: req.params.id })
  // ... handler logic
})
```

### React Error Boundary

```typescript
import { createLogger } from 'zero-log'

const logger = createLogger({
  name: 'react-app',
  piiMasking: {
    regexPatterns: [commonRegexPatterns.email, commonRegexPatterns.phoneIndia]
  }
})

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }
}
```

## 📊 Performance

zero-log is built for performance:

- **< 250ns overhead** per log entry (Node.js)
- **< 5KB gzipped** core bundle (browser)
- **Async batching** with 16ms flush intervals
- **Zero dependencies** in core (except Pino)

## 🛠️ Development

### Prerequisites
- Node.js ≥ 18
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/bytes-by-talari/zero-log.git
cd zero-log

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

### Scripts
- `npm run build` - Build the library
- `npm run dev` - Development mode with watch
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript type checking

## 📚 API Reference

### Core Functions

#### `createLogger(options: LoggerOptions): Logger`
Creates a new logger instance with the specified options.

#### `createDefaultLogger(name: string, options?: Partial<LoggerOptions>): Logger`
Creates a logger with sensible defaults including basic PII masking.

#### `createProductionLogger(name: string, options?: Partial<LoggerOptions>): Logger`
Creates a production logger with enhanced PII masking and security features.

### Logger Methods

```typescript
interface Logger {
  // Logging methods
  trace(msg: string, attrs?: Record<string, unknown>): void
  debug(msg: string, attrs?: Record<string, unknown>): void
  info(msg: string, attrs?: Record<string, unknown>): void
  warn(msg: string, attrs?: Record<string, unknown>): void
  error(msg: string, attrs?: Record<string, unknown> | Error): void
  fatal(msg: string, attrs?: Record<string, unknown> | Error): void
  
  // Context management
  child(context: Record<string, unknown>): Logger
  with<T>(context: Record<string, unknown>, fn: () => T): T
  
  // Utilities
  time(label: string): Timer
  count(name: string, delta?: number, attrs?: Record<string, unknown>): void
  capture(error: Error, attrs?: Record<string, unknown>): void
  flush(): Promise<void>
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Pino](https://github.com/pinojs/pino) - the fastest JSON logger
- Inspired by the need for comprehensive PII protection in Indian applications
- Thanks to all contributors and the open source community

## 📞 Support

- 📖 [Integration Guide](INTEGRATION.md) - Detailed integration examples
- 🐛 [Report Issues](https://github.com/bytes-by-talari/zero-log/issues)
- 💬 [Discussions](https://github.com/bytes-by-talari/zero-log/discussions)
- 📧 [Email Support](mailto:support@example.com)

---

<div align="center">

**Made with ❤️ for the Indian developer community**

[⭐ Star this repo](https://github.com/bytes-by-talari/zero-log) • [🐛 Report Bug](https://github.com/bytes-by-talari/zero-log/issues) • [💡 Request Feature](https://github.com/bytes-by-talari/zero-log/issues)

</div>