import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ToolCommand, CommandContext } from '../lib/types.js';
import { SoracomClient } from '../lib/soracom-client.js';
import { ERROR_MESSAGES } from '../lib/constants.js';

/**
 * Simple base class for SORACOM MCP commands.
 * Provides consistent error handling across all commands.
 */
export abstract class BaseCommand implements ToolCommand {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: object;

  /**
   * Execute the command with automatic error handling.
   * Subclasses should implement executeCommand instead of execute.
   */
  async execute(args: unknown, context?: CommandContext): Promise<CallToolResult> {
    try {
      return await this.executeCommand(args, context);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Validate that SORACOM credentials are present in the context.
   */
  private validateCredentials(context?: CommandContext): asserts context is CommandContext {
    if (!context?.config.authKeyId || !context?.config.authKeyToken) {
      throw new Error(ERROR_MESSAGES.MISSING_CREDENTIALS);
    }
  }

  /**
   * Get an authenticated client instance.
   * Convenience method for subclasses.
   */
  protected async getAuthenticatedClient(context?: CommandContext): Promise<SoracomClient> {
    this.validateCredentials(context);

    return await SoracomClient.getInstance({
      authKeyId: context.config.authKeyId,
      authKeyToken: context.config.authKeyToken,
      coverage: context.config.coverage,
    });
  }

  /**
   * Format successful response.
   * Convenience method for subclasses.
   */
  protected formatSuccess(data: unknown, metadata?: Record<string, unknown>): CallToolResult {
    const response = {
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  /**
   * Format list response.
   * Convenience method for subclasses.
   */
  protected formatListResponse(
    items: unknown[],
    metadata?: Record<string, unknown>,
  ): CallToolResult {
    return this.formatSuccess(
      {
        items,
        count: items.length,
      },
      metadata,
    );
  }

  /**
   * Format error response.
   * Used internally by execute method.
   */
  private formatError(error: unknown): CallToolResult {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }

  /**
   * Execute the command implementation.
   * Must be implemented by each command subclass.
   */
  protected abstract executeCommand(
    args: unknown,
    context?: CommandContext,
  ): Promise<CallToolResult>;
}
