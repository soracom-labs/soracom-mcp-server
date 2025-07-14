#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getAllCommands, getCommand } from './commands/index.js';
import { ServerConfig, CommandContext, CoverageType } from './lib/types.js';
import { logger } from './lib/logger.js';
import { getEnv } from './lib/env.js';
import { authManager } from './lib/auth-manager.js';
import { SoracomClient } from './lib/soracom-client.js';
import { getVersion } from './lib/version.js';

const server = new Server(
  {
    name: 'soracom-mcp-server',
    version: getVersion(),
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const commands = getAllCommands();
  logger.debug('Listing available tools', { count: commands.length });

  // Sort commands alphabetically by name
  const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name));

  return {
    tools: sortedCommands.map((cmd) => {
      const schema = cmd.inputSchema as { properties?: Record<string, unknown> };
      // Add coverage parameter to all commands
      const enhancedSchema = {
        ...schema,
        properties: {
          ...schema.properties,
          coverage: {
            type: 'string',
            enum: ['jp', 'g'],
            description: 'API coverage region (default: jp for Japan, g for Global coverage)',
          },
        },
      };

      return {
        name: cmd.name,
        description: cmd.description,
        inputSchema: enhancedSchema,
      };
    }),
  };
});

// Initialize components
const env = getEnv();

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const config: ServerConfig = {
    authKeyId: env.SORACOM_AUTH_KEY_ID,
    authKeyToken: env.SORACOM_AUTH_KEY,
    coverage: env.SORACOM_COVERAGE_TYPE,
  };

  const { name, arguments: args } = request.params;

  // Pass through args directly - validation happens in commands via zod
  const sanitizedArgs = args || {};

  logger.info(`Executing tool: ${name}`);

  const command = getCommand(name);

  if (!command) {
    logger.error(`Unknown tool requested: ${name}`);
    return {
      content: [
        {
          type: 'text',
          text: `Error: Unknown tool: ${name}`,
        },
      ],
    };
  }

  // Extract coverage from args and merge with config
  const sanitizedArgsObj = sanitizedArgs as Record<string, unknown>;
  const coverage = (sanitizedArgsObj['coverage'] as string) || config.coverage || 'jp';
  const contextConfig: ServerConfig = {
    ...config,
    coverage: coverage as CoverageType,
  };

  const context: CommandContext = { config: contextConfig };

  try {
    const result = await command.execute(sanitizedArgs, context);
    logger.debug(`Tool ${name} executed successfully`);
    return result;
  } catch (error) {
    logger.error(`Tool ${name} execution failed`, {
      error: error instanceof Error ? error.message : error,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

logger.info('SORACOM MCP Server started');

// Simple graceful shutdown handlers
const handleShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Clear all caches
  authManager.clearAll();

  // Dispose all client instances
  await SoracomClient.clearAll();

  logger.info('Graceful shutdown completed');
  process.exit(0);
};

process.once('SIGTERM', () => handleShutdown('SIGTERM'));
process.once('SIGINT', () => handleShutdown('SIGINT'));
