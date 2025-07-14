import { describe, it, expect } from 'vitest';
import { BaseCommand } from '../../../src/commands/base-command.js';
import { CommandContext } from '../../../src/lib/types.js';

class TestCommand extends BaseCommand {
  name = 'testCommand';
  description = 'Test command';
  inputSchema = {
    type: 'object',
    properties: {
      testParam: { type: 'string' },
    },
  };

  protected async executeCommand(args: unknown, _context?: CommandContext) {
    // Test different response types
    if ((args as any).error) {
      throw new Error('Test error');
    }
    if ((args as any).list) {
      return this.formatListResponse(['item1', 'item2']);
    }
    return this.formatSuccess({ result: 'success' });
  }
}

describe('BaseCommand', () => {
  const command = new TestCommand();
  const context: CommandContext = {
    config: {
      authKeyId: 'test-key',
      authKeyToken: 'test-token',
      coverage: 'jp',
    },
  };

  describe('formatSuccess', () => {
    it('should format success response correctly', async () => {
      const result = await command.execute({}, context);

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed.metadata).toHaveProperty('timestamp');
    });
  });

  describe('formatListResponse', () => {
    it('should format list response correctly', async () => {
      const result = await command.execute({ list: true }, context);

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data).toHaveProperty('items');
      expect(parsed.data).toHaveProperty('count');
      expect(parsed.data.items).toHaveLength(2);
      expect(parsed.data.count).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should format error response correctly', async () => {
      const result = await command.execute({ error: true }, context);

      expect(result).toHaveProperty('isError', true);
      expect(result.content[0].text).toContain('Error: Test error');
    });
  });
});
