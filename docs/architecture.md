# Architecture Overview

## Project Structure

```
soracom-mcp-server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/                  # SORACOM API implementations
│   │   ├── types/           # API-related type definitions
│   │   ├── api-utils.ts     # API utility functions
│   │   ├── billing.ts       # Billing API functions
│   │   ├── group.ts         # Group API functions
│   │   ├── query.ts         # Search/query API functions
│   │   ├── sim.ts           # SIM API functions
│   │   └── stats.ts         # Statistics API functions
│   ├── commands/             # MCP command implementations
│   │   ├── base-command.ts  # Base class for all commands
│   │   ├── auth/            # Authentication commands
│   │   ├── billing/         # Billing API commands
│   │   ├── group/           # Group management commands
│   │   ├── query/           # Search/query commands
│   │   ├── sim/             # SIM management commands
│   │   └── stats/           # Statistics API commands
│   └── lib/                  # Shared utilities and core functionality
│       ├── soracom-client.ts # SORACOM API client with auth
│       ├── auth-manager.ts   # Auth token caching
│       ├── constants.ts      # Application constants
│       ├── env.ts           # Environment configuration
│       ├── error.ts         # Error handling utilities
│       ├── logger.ts        # Logging utilities
│       ├── security-headers.ts # HTTP security headers
│       ├── types.ts         # Core type definitions
│       └── version.ts       # Version management
└── tests/                    # Test files (mirrors src structure)
    ├── unit/
    │   ├── api/             # API function tests
    │   ├── commands/        # Command tests
    │   └── lib/             # Library/utility tests
    └── integration/         # Integration tests
```

## Key Components

### 1. MCP Server (`index.ts`)

- Implements Model Context Protocol server
- Registers all available commands
- Handles command routing and execution
- Dynamically reads version from package.json

### 2. Command Pattern (`BaseCommand`)

All commands extend `BaseCommand` (located in `src/commands/base-command.ts`) which provides:

- Authentication handling via `getAuthenticatedClient()`
- Standardized response formatting (`formatSuccess`, `formatListResponse`)
- Input validation with Zod schemas
- Coverage parameter support for all commands

### 3. Authentication Flow

```
Command → getAuthenticatedClient() → SoracomClient.getInstance()
                                          ↓
                                    Check auth cache
                                          ↓
                                    Authenticate if needed
                                          ↓
                                    Return client with API modules
```

### 4. Client Caching & Authentication

- **Client Instances**: Cached per `authKeyId:coverage` pair in `SoracomClient`
- **Auth Tokens**: Cached for 1 hour with 5-minute expiry buffer in `AuthManager`
- **Auto Re-authentication**: Automatic re-authentication on 401 errors via axios interceptors
- **Simplified Design**: Direct implementation without complex lock mechanisms for incubation-level simplicity

## Adding New Commands

1. Create command file in appropriate category folder:

```typescript
// src/commands/sim/new-command.ts
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

export class NewCommand extends BaseCommand {
  name = 'Sim_newCommand'; // Category_operationId from SORACOM API
  description = 'Description of the command';
  inputSchema = {
    type: 'object',
    properties: {
      simId: { type: 'string', description: 'SIM ID' },
    },
    required: ['simId'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const validatedArgs = this.validateInput(args);
    const client = await this.getAuthenticatedClient(context);

    // Implementation - BaseCommand handles error wrapping automatically
    const result = await client.sim.getSim(validatedArgs.simId);
    return this.formatSuccess(result);
  }
}
```

2. Register in `src/commands/index.ts`:

```typescript
import { NewCommand } from './sim/new-command.js';

// Add to commands Map
export const commands = new Map<string, ToolCommand>([
  // ... existing commands
  ['Sim_newCommand', new NewCommand()],
]);
```

3. Add tests in `tests/unit/commands/` following existing patterns

## Design Principles

- **Keep Simplicity**: Keep implementations simple and direct, avoid over-engineering
- **Clear Organization**: 3 main directories (`api/`, `commands/`, `lib/`) for easy navigation
- **Category-Based Organization**: Commands grouped by SORACOM API tags matching the official API specification
- **Type-safe**: Full TypeScript with Zod validation for all command inputs
- **Read-only**: Only GET operations supported (no create/update/delete)

## Future Architecture Plans

### Transition from 1:1 API-to-Command Mapping

The current architecture implements a direct 1:1 mapping between SORACOM API operations and MCP commands. While this provides comprehensive API coverage, we are considering a more intelligent approach for the future.

### Proposed Two-Command Architecture

**Target Timeline**: Future release (TBD)

The future architecture will consist of only two commands:

1. **API Discovery Command**
   - **Purpose**: Understands user intent and suggests appropriate APIs
   - **Input**: Natural language description of what the user wants to achieve
   - **Output**: List of recommended API operations with parameters
   - **Example**:
     ```
     User: "I want to check my data usage for this month"
     Response: Suggests `Stats_getAirStats` with appropriate time range parameters
     ```

2. **API Execution Command**
   - **Purpose**: Executes the selected API operation
   - **Input**: API operation ID and parameters
   - **Output**: API response data
   - **Features**:
     - Unified error handling
     - Automatic parameter validation
     - Response formatting

### Benefits of the New Architecture

- **Improved User Experience**: Users don't need to know exact API names
- **Intelligent Assistance**: System can suggest optimal API combinations
- **Simplified Maintenance**: Only two commands to maintain instead of dozens
- **Better Abstraction**: Hides API complexity while maintaining full access
