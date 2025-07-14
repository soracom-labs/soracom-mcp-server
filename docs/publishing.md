# Publishing Guide

This document covers local development and publishing to npm.

## Local Development

### Setup

1. **Prerequisites**:
   - Node.js v22+ (required)
   - npm

2. Clone the repository:

   ```bash
   git clone https://github.com/soracom-labs/soracom-mcp-server.git
   cd soracom-mcp-server
   npm install
   ```

3. Set up environment variables:
   ```bash
   export SORACOM_AUTH_KEY_ID=your-key-id
   export SORACOM_AUTH_KEY=your-token
   export SORACOM_COVERAGE_TYPE=jp  # or "g" for global
   ```

### Development Workflow

```bash
# Run in development mode (TypeScript directly)
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Run built version
npm start
```

### Testing with Claude Desktop

See [Claude Desktop Configuration](./claude-desktop-config.md) for setting up local development with Claude Desktop.

## Publishing to npm

### Prerequisites

1. npm account with publish access to @soracom-labs scope
2. Logged in to npm: `npm login`

### Publishing Steps

1. **Run tests and checks**:

   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

2. **Update version**:

   ```bash
   npm version patch  # or minor, major
   ```

3. **Build**:

   ```bash
   npm run build
   ```

4. **Publish**:
   ```bash
   npm publish
   ```

### Manual Release Process

Releases are handled manually to ensure quality control:

```bash
# Update version
npm version patch  # Creates patch version tag (1.6.0 → 1.6.1)
npm version minor  # Creates minor version tag (1.6.0 → 1.7.0)
npm version major  # Creates major version tag (1.6.0 → 2.0.0)

# Push version and tags
git push origin main
git push origin --tags

# Manual publish to npm
npm publish
```

## Troubleshooting

- **401 Unauthorized**: Check npm login status with `npm whoami`
- **403 Forbidden**: Ensure you have publish access to @soracom-labs scope
- **Build failures**: Run `npm run check` to verify all checks pass
- **Missing dist folder**: Run `npm run build` before publishing
