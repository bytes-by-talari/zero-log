# Contributing to zero-log

Thank you for your interest in contributing to zero-log! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/zero-log.git
   cd zero-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a development branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start development**
   ```bash
   npm run dev  # Watch mode for development
   ```

## 🧪 Testing

We use Vitest for testing. Please ensure all tests pass before submitting a PR.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows the project's style guidelines.

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

## 🏗️ Building

```bash
# Build the project
npm run build

# Clean build artifacts
npm run clean
```

## 📋 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all tests pass**
6. **Submit a pull request** with a clear description

### PR Guidelines

- Use clear, descriptive commit messages
- Reference any related issues
- Include screenshots for UI changes
- Update documentation as needed
- Ensure CI passes

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment details** (Node.js version, OS, etc.)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or error logs if applicable
- **Minimal reproduction case** if possible

## 💡 Feature Requests

For feature requests, please:

- Check existing issues first
- Provide a clear use case
- Explain the expected behavior
- Consider the impact on existing users

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 🔧 Development Guidelines

### Code Structure

```
src/
├── core/           # Core logger implementation
├── processors/     # PII masking processors
├── transports/     # Output transports (Sentry, HTTP, etc.)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Adding New PII Patterns

When adding new PII masking patterns:

1. Add the pattern to `src/processors/regex-mask.ts`
2. Include appropriate tests
3. Update documentation
4. Consider both Indian and international patterns

### Adding New Transports

When adding new transports:

1. Create a new file in `src/transports/`
2. Follow the existing transport interface
3. Add proper error handling
4. Include tests
5. Update exports in `src/index.ts`

## 📚 Documentation

- Update README.md for user-facing changes
- Update Spec.md for architectural changes
- Add JSDoc comments for new functions
- Include usage examples

## 🚀 Release Process

Releases are handled by maintainers. When your PR is merged:

1. Version will be bumped automatically
2. Changelog will be updated
3. Release notes will be generated
4. Package will be published

## 💬 Community

- Join our [Discussions](https://github.com/yourusername/zero-log/discussions)
- Follow us on [Twitter](https://twitter.com/yourusername)
- Check out our [Wiki](https://github.com/yourusername/zero-log/wiki)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to zero-log! 🎉
