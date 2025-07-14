# Claude Desktop Configuration

Configuration options for using SORACOM MCP Server with Claude Desktop.

## Basic Configuration

For basic setup including configuration examples and environment variables, see the [Configuration section in README.md](../README.md#configuration).

## Local Development

For development with immediate code changes:

```json
{
  "mcpServers": {
    "soracom": {
      "command": "npx",
      "args": ["tsx", "/path/to/soracom-mcp-server/src/index.ts"],
      "env": {
        "SORACOM_AUTH_KEY_ID": "your-key-id",
        "SORACOM_AUTH_KEY": "your-token",
        "SORACOM_COVERAGE_TYPE": "jp"
      }
    }
  }
}
```

### Development Setup Steps

1. **Prerequisites**:
   - Node.js v22+ (required)
   - npm

2. **Clone and install**:

   ```bash
   git clone https://github.com/soracom-labs/soracom-mcp-server.git
   cd soracom-mcp-server
   npm install
   ```

3. **Configure Claude Desktop** with the configuration above

4. **Restart Claude Desktop** to load the new configuration

5. **Test the connection** by asking Claude to use a SORACOM command:
   ```
   List my SIMs using the Sim_listSims command
   ```

### Development Tips

- No build step needed - changes are reflected immediately
- Check Claude Desktop logs for debugging: `~/Library/Logs/Claude/mcp*.log`
- Run `npm run dev` in terminal to test the server standalone

## Environment Variables

For complete environment variable documentation, see [README.md](../README.md#environment-variables).

Additional development-specific variables:

- `SORACOM_LOG_LEVEL`: Logging level (DEBUG, INFO, WARN, ERROR), defaults to INFO

## Troubleshooting

### Common Issues

- **Module not found**: Run `npm install` in the project directory
- **Invalid credentials**: Verify SORACOM auth key ID and token
- **Server not starting**: Check Claude Desktop logs for detailed errors
- **Changes not reflected**: Restart Claude Desktop after config changes

### Debug Mode

For detailed logging during development:

```json
{
  "mcpServers": {
    "soracom": {
      "command": "npx",
      "args": ["tsx", "/path/to/soracom-mcp-server/src/index.ts"],
      "env": {
        "SORACOM_AUTH_KEY_ID": "your-key-id",
        "SORACOM_AUTH_KEY": "your-token",
        "SORACOM_COVERAGE_TYPE": "jp",
        "SORACOM_LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```
