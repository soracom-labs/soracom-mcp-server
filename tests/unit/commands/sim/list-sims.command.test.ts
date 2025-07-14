import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListSimsCommand } from '../../../../src/commands/sim/list-sims.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('ListSimsCommand', () => {
  const mockClient = {
    sim: {
      listSims: vi.fn(),
    },
  };

  const context: CommandContext = {
    config: {
      authKeyId: 'test-key-id',
      authKeyToken: 'test-key-token',
      coverage: 'jp',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SoracomClient.getInstance).mockResolvedValue(mockClient as any);
  });

  describe('execute', () => {
    it('should list SIMs successfully', async () => {
      const mockSims = [
        { simId: '123', name: 'Test SIM 1', status: 'active' },
        { simId: '456', name: 'Test SIM 2', status: 'inactive' },
      ];
      mockClient.sim.listSims.mockResolvedValue(mockSims);

      const command = new ListSimsCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.any(String),
          },
        ],
      });

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.items).toHaveLength(2);
      expect(parsed.data.count).toBe(2);
      expect(mockClient.sim.listSims).toHaveBeenCalledWith({ limit: 10 });
    });

    it('should apply filters correctly', async () => {
      const mockSims = [{ simId: '123', name: 'Test SIM', status: 'active' }];
      mockClient.sim.listSims.mockResolvedValue(mockSims);

      const command = new ListSimsCommand();
      const args = {
        limit: 10,
      };

      await command.execute(args, context);

      expect(mockClient.sim.listSims).toHaveBeenCalledWith({
        limit: 10,
      });
    });

    it('should handle empty results', async () => {
      mockClient.sim.listSims.mockResolvedValue([]);

      const command = new ListSimsCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.any(String),
          },
        ],
      });

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.items).toHaveLength(0);
      expect(parsed.data.count).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('API Error');
      mockClient.sim.listSims.mockRejectedValue(error);

      const command = new ListSimsCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: API Error'),
          },
        ],
        isError: true,
      });
    });

    it('should validate input schema', async () => {
      const command = new ListSimsCommand();
      const invalidArgs = {
        statusFilter: 'invalid-status',
      };

      const result = await command.execute(invalidArgs, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error'),
          },
        ],
        isError: true,
      });
    });

    it('should handle missing credentials', async () => {
      const command = new ListSimsCommand();
      const invalidContext = {
        config: {
          authKeyId: '',
          authKeyToken: '',
          coverage: 'jp' as const,
        },
      };

      const result = await command.execute({}, invalidContext);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('SORACOM credentials not configured'),
          },
        ],
        isError: true,
      });
    });
  });
});
