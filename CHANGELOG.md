# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- India-specific PII masking patterns
- Comprehensive documentation
- Contributing guidelines
- MIT License

## [0.1.0] - 2024-09-17

### Added
- Initial release of zero-log
- High-performance logging built on Pino
- Advanced PII masking with regex and path-based patterns
- India-specific patterns (Aadhaar, PAN, IFSC, UPI, etc.)
- Sentry integration for error reporting
- Context management with child loggers
- Timer and counter utilities
- TypeScript support with full type definitions
- Browser and Node.js compatibility
- Comprehensive test suite
- Multiple distribution methods (NPM, Git, Direct copy)

### Features
- **PII Masking**: Comprehensive protection for sensitive data
- **India-Specific Patterns**: Aadhaar, PAN, IFSC, UPI, vehicle numbers, driving license, passport
- **International Patterns**: Email, credit cards, phone numbers, IP addresses, API keys, JWTs
- **Performance**: < 250ns overhead per log entry
- **Flexibility**: Multiple integration methods without NPM dependency
- **Type Safety**: Full TypeScript support
- **Extensibility**: Pluggable processors and transports

### Technical Details
- Built on Pino for ultra-fast JSON logging
- Zero hard dependencies (except Pino)
- ESM and CommonJS support
- Tree-shakeable for optimal bundle size
- Comprehensive error handling
- Async batching for performance
