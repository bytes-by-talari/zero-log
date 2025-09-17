# Integration Guide

This guide provides detailed examples of integrating zero-log into your project without using NPM. For quick setup, see the [main README](README.md).

## 🚀 Quick Integration Methods

### Method 1: Git Submodule (Recommended)

This method keeps zero-log as a submodule, allowing you to easily update it.

```bash
# Add zero-log as a submodule
git submodule add https://github.com/yourusername/zero-log.git libs/zero-log

# Initialize and update submodules
git submodule init
git submodule update

# Install zero-log dependencies
cd libs/zero-log
npm install

# Build zero-log
npm run build

# Go back to your project root
cd ../..

# Install Pino (required dependency)
npm install pino
```

**Usage in your project:**
```typescript
// Import from the submodule
import { createLogger } from './libs/zero-log/dist/index.js'

const logger = createLogger({
  name: 'my-app',
  piiMasking: {
    regexPatterns: [/* your patterns */]
  }
})
```

**Updating zero-log:**
```bash
cd libs/zero-log
git pull origin main
npm run build
cd ../..
```

### Method 2: Direct Copy

Copy the source files directly into your project.

```bash
# Clone zero-log
git clone https://github.com/yourusername/zero-log.git temp-zero-log

# Copy source files to your project
cp -r temp-zero-log/src ./libs/zero-log

# Clean up
rm -rf temp-zero-log

# Install Pino dependency
npm install pino
```

**Usage in your project:**
```typescript
// Import from copied source
import { createLogger } from './libs/zero-log/core/factory'

const logger = createLogger({
  name: 'my-app'
})
```

### Method 3: Manual Build Integration

Build zero-log separately and copy the built files.

```bash
# Clone and build zero-log
git clone https://github.com/yourusername/zero-log.git
cd zero-log
npm install
npm run build

# Copy built files to your project
cp -r dist ../your-project/libs/zero-log/

# Install Pino in your project
cd ../your-project
npm install pino
```

## 🏗️ Project Structure Examples

### Express.js Project

```
your-express-app/
├── libs/
│   └── zero-log/          # zero-log integration
│       ├── dist/
│       └── package.json
├── src/
│   ├── middleware/
│   │   └── logging.ts     # Logging middleware
│   └── app.ts
├── package.json
└── tsconfig.json
```

**logging.ts:**
```typescript
import { createLogger } from '../../libs/zero-log/dist/index.js'

export const logger = createLogger({
  name: 'express-app',
  piiMasking: {
    regexPatterns: [
      // Add your patterns here
    ]
  }
})

export const loggingMiddleware = (req: any, res: any, next: any) => {
  const requestLogger = logger.child({
    requestId: req.headers['x-request-id'],
    method: req.method,
    url: req.url
  })
  
  req.logger = requestLogger
  next()
}
```

### React/Next.js Project

```
your-react-app/
├── lib/
│   └── zero-log/          # zero-log integration
│       └── dist/
├── src/
│   ├── utils/
│   │   └── logger.ts      # Logger configuration
│   └── components/
├── package.json
└── next.config.js
```

**logger.ts:**
```typescript
import { createLogger } from '../../lib/zero-log/dist/browser.js'

export const logger = createLogger({
  name: 'react-app',
  piiMasking: {
    regexPatterns: [
      // Browser-safe patterns
    ]
  }
})
```

### Node.js Microservice

```
your-microservice/
├── libs/
│   └── zero-log/          # zero-log integration
│       └── dist/
├── src/
│   ├── services/
│   │   └── logger.ts      # Logger service
│   └── index.ts
├── package.json
└── Dockerfile
```

**logger.ts:**
```typescript
import { createProductionLogger } from '../../libs/zero-log/dist/index.js'

export const logger = createProductionLogger('microservice', {
  piiMasking: {
    regexPatterns: [
      // Production patterns
    ]
  }
})
```

## 🔧 Configuration Examples

### Basic Configuration

```typescript
import { createLogger } from './libs/zero-log/dist/index.js'

const logger = createLogger({
  name: 'my-service',
  level: 'info',
  piiMasking: {
    sensitivePaths: ['password', 'token'],
    maskValue: '[REDACTED]'
  }
})
```

### India-Specific Configuration

```typescript
import { createLogger, commonRegexPatterns } from './libs/zero-log/dist/index.js'

const logger = createLogger({
  name: 'india-service',
  piiMasking: {
    sensitivePaths: [
      'aadhaar', 'pan', 'bankAccount', 'ifsc', 'upi'
    ],
    regexPatterns: [
      commonRegexPatterns.aadhaar,
      commonRegexPatterns.pan,
      commonRegexPatterns.phoneIndia,
      commonRegexPatterns.bankAccount,
      commonRegexPatterns.ifsc,
      commonRegexPatterns.upi
    ],
    deepScan: true
  }
})
```

### Production Configuration

```typescript
import { createProductionLogger } from './libs/zero-log/dist/index.js'

const logger = createProductionLogger('prod-service', {
  piiMasking: {
    // All India-specific patterns included
    maskValue: '[REDACTED]',
    partialMasking: true
  }
})
```

## 📦 Package.json Integration

Add zero-log as a local dependency:

```json
{
  "name": "your-project",
  "dependencies": {
    "pino": "^8.17.0"
  },
  "scripts": {
    "update-zero-log": "cd libs/zero-log && git pull && npm run build",
    "build": "npm run build:app && npm run build:zero-log",
    "build:zero-log": "cd libs/zero-log && npm run build",
    "build:app": "tsc"
  }
}
```

## 🐳 Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

# Copy your project
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

# Build zero-log
RUN cd libs/zero-log && npm install && npm run build

# Build your application
RUN npm run build

# Start your application
CMD ["npm", "start"]
```

## 🔄 Updating zero-log

### Git Submodule Method
```bash
cd libs/zero-log
git pull origin main
npm run build
cd ../..
```

### Direct Copy Method
```bash
# Remove old version
rm -rf libs/zero-log

# Clone latest version
git clone https://github.com/yourusername/zero-log.git temp-zero-log
cp -r temp-zero-log/src ./libs/zero-log
rm -rf temp-zero-log
```

## 🧪 Testing Integration

```typescript
// test-logger.ts
import { createLogger } from './libs/zero-log/dist/index.js'

describe('Logger Integration', () => {
  it('should mask PII correctly', () => {
    const logger = createLogger({
      name: 'test',
      piiMasking: {
        regexPatterns: [/* test patterns */]
      }
    })
    
    // Test your logging functionality
  })
})
```

## 🚨 Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure you've installed Pino: `npm install pino`
   - Check the import path is correct
   - Verify the dist folder exists

2. **TypeScript errors**
   - Make sure you're importing from the correct path
   - Check if TypeScript can find the type definitions

3. **Build errors**
   - Ensure zero-log is built: `cd libs/zero-log && npm run build`
   - Check Node.js version compatibility

### Getting Help

- Check the [main README](README.md) for usage examples
- Open an [issue](https://github.com/yourusername/zero-log/issues) for bugs
- Start a [discussion](https://github.com/yourusername/zero-log/discussions) for questions

## 📚 Additional Resources

- [Main Documentation](README.md)
- [API Reference](README.md#-api-reference)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
