# Contributing Guide

Thank you for your interest in contributing to AI More Context! This document provides guidelines and instructions for contributing.

## Getting Started

### 1. Setup
```bash
# Clone the repository
git clone https://github.com/WEBLAZER/ai-more-context.git
cd ai-more-context

# Install dependencies
npm install
```

### 2. Create a Branch
```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-name
```

### 3. Development
- Make your changes
- Follow code conventions
- Test your changes
- Compile the extension: `npm run compile`

### 4. Commits
```bash
# View modified files
git status

# Add files
git add .

# Create a commit
git commit -m "Clear description of your changes"
```

### 5. Pull Request
1. Push your branch: `git push origin feature/your-feature-name`
2. Create a Pull Request on GitHub
3. Describe your changes
4. Wait for review

## Code Conventions

### TypeScript
- Use standard TypeScript code style
- Document functions and classes
- Avoid using `any`
- Use strict types

### Commit Messages
Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(capture): add screenshot capture functionality
fix(websocket): handle connection errors
docs(readme): update installation instructions
```

## Version Management

We follow [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
  - MAJOR: Incompatible changes
  - MINOR: Compatible new features
  - PATCH: Compatible bug fixes

### Version Update
1. Update `package.json`
2. Update `CHANGELOG.md`
3. Create Git tag

## Publishing Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Compile: `npm run compile`
4. Publish: `vsce publish -p YOUR_TOKEN`

## Testing

### Unit Tests
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Manual Testing
1. Compile: `npm run compile`
2. Launch in debug mode (F5 in VSCode)
3. Test features

## Documentation

### Updating Documentation
- README.md: Main documentation
- CHANGELOG.md: Version history
- CONTRIBUTING.md: Contributing guide
- Code: Comments and JSDoc

### Documentation Format
```typescript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return description
 */
```

## Questions and Support

If you have questions:
1. Check the documentation
2. Open an issue on GitHub
3. Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same MIT license as the project.