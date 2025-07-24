# SORACOM MCP Server

[![npm version](https://badge.fury.io/js/@soracom-labs%2Fsoracom-mcp-server.svg)](https://www.npmjs.com/package/@soracom-labs/soracom-mcp-server)
[![CI](https://github.com/soracom-labs/soracom-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/soracom-labs/soracom-mcp-server/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **⚠️ EARLY ACCESS**: This is an early access project and is provided as-is. There is no guarantee of continued support or maintenance. Use at your own risk.

A Model Context Protocol (MCP) server for interacting with SORACOM APIs.

## Quick Start

### Prerequisites

- Node.js v22+ (ES modules support)
- SORACOM Auth Key (ID and Token)

### Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

#### Authentication Methods

There are two ways to authenticate with SORACOM:

1. **Direct environment variables** - Set auth key ID and token directly
2. **SORACOM CLI profile** - Use existing SORACOM CLI profile credentials

#### Method 1: Using Auth Key Environment Variables

```json
{
  "mcpServers": {
    "soracom": {
      "command": "npx",
      "args": ["@soracom-labs/soracom-mcp-server"],
      "env": {
        "SORACOM_AUTH_KEY_ID": "your-key-id",
        "SORACOM_AUTH_KEY": "your-token",
        "SORACOM_COVERAGE_TYPE": "jp"
      }
    }
  }
}
```

**Required environment variables:**

- **SORACOM_AUTH_KEY_ID**: Your SORACOM authentication key ID
- **SORACOM_AUTH_KEY**: Your SORACOM authentication key token

**Get your authentication keys from:**

- [Manage Root User Credentials](https://users.soracom.io/ja-jp/guides/basic-knowledge/manage-root-user-credentials) (Japanese)
- [AuthKeys](https://developers.soracom.io/en/docs/security/authkeys/) (English)

#### Method 2: Using SORACOM CLI Profile

If you have configured SORACOM CLI profiles, you can use them instead:

```json
{
  "mcpServers": {
    "soracom": {
      "command": "npx",
      "args": ["@soracom-labs/soracom-mcp-server"],
      "env": {
        "SORACOM_PROFILE": "production"
      }
    }
  }
}
```

**Required environment variable:**

- **SORACOM_PROFILE**: SORACOM CLI profile name
  - Credentials are loaded from `~/.soracom/<profile>.json`
  - Profile file should contain `authKeyId` and `authKey` fields
  - See [SORACOM CLI Basic Usage](https://github.com/soracom/soracom-cli?tab=readme-ov-file#basic-usage) for profile configuration details

#### Common Environment Variable (Both Methods)

- **SORACOM_COVERAGE_TYPE**: API coverage region
  - `"jp"` for Japan coverage
  - `"g"` for Global coverage
  - **Priority**: Environment variable > Profile `coverageType` > Default `"jp"`

That's it! No installation needed - npx will download and run the server automatically.

#### Security Recommendation

For enhanced security, we recommend creating a SAM (SORACOM Access Management) user with permissions limited to only the necessary API operations, rather than using your root user credentials. Generate the AuthKey ID and Token from this SAM user for use with this MCP server.

#### Using with Docker

You can also run the MCP server using Docker. Build the image with the following command:

```bash
docker build -t soracom-mcp-server:latest .
```

Settings are like below:

```json
{
  "mcpServers": {
    "soracom": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "SORACOM_AUTH_KEY_ID",
        "-e",
        "SORACOM_AUTH_KEY",
        "soracom-mcp-server:latest"
      ],
      "env": {
        "SORACOM_AUTH_KEY_ID": "your-key-id",
        "SORACOM_AUTH_KEY": "your-token",
        "SORACOM_COVERAGE_TYPE": "jp"
      }
    }
  }
}
```

## Usage

### Command Naming Convention

All commands follow the pattern `Category_operationId` where:

- **Category** is the API category (e.g., `Sim`, `Billing`, `Stats`)
- **operationId** is the operation name from the SORACOM API

Examples:

- `Sim_getSim` - Get SIM information
- `Billing_getLatestBilling` - Get latest billing information
- `Query_searchSims` - Search for SIMs

### Example Commands in Claude Desktop

```
Get information for SIM ID "8981100000000000000" using the Sim_getSim command
List all active SIMs with limit 10 using the Sim_listSims command
Show billing for current month using the Billing_getLatestBilling command
Find SIMs with name containing "production" using the Query_searchSims command
```

### Coverage Selection

- **Default**: Set `SORACOM_COVERAGE_TYPE` to `"jp"` or `"g"` in config
- **Per-command**: Each command accepts optional `coverage` parameter

## Available Tools

See [Available Tools Documentation](docs/available-tools.md) for the complete list of supported commands.

## Development

See development guides for setup and workflow:

- [Local Development Guide](docs/publishing.md#local-development) - Setup and workflow
- [Claude Desktop Development](docs/claude-desktop-config.md#local-development) - Testing with Claude Desktop
- [Architecture Documentation](docs/architecture.md) - Project structure and design

## License

MIT
