import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { SoracomClient } from './soracom-client.js';

export interface ToolCommand {
  name: string;
  description: string;
  inputSchema: object;
  execute(args: unknown, context: CommandContext): Promise<CallToolResult>;
}

export type CoverageType = 'jp' | 'g';

export interface ServerConfig {
  authKeyId: string;
  authKeyToken: string;
  coverage: CoverageType;
}

export interface CommandContext {
  config: ServerConfig;
  client?: SoracomClient;
}
