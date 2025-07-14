import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListSimStatusHistoryCommand } from '../../../../src/commands/sim/list-sim-status-history.command.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SimStatusHistory } from '../../../../src/api/types/sim.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('ListSimStatusHistoryCommand', () => {
  const mockClient = {
    sim: {
      listSimStatusHistory: vi.fn(),
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
    it('should list status history successfully', async () => {
      const mockHistory: SimStatusHistory[] = [
        {
          status: 'active',
          timestamp: 1704067200000,
          previousStatus: 'ready',
          operatorId: 'OP1234567890',
        },
        {
          status: 'suspended',
          timestamp: 1704153600000,
          previousStatus: 'active',
          operatorId: 'OP1234567890',
        },
        {
          status: 'terminated',
          timestamp: 1704240000000,
          previousStatus: 'suspended',
          operatorId: 'OP1234567890',
        },
      ];
      mockClient.sim.listSimStatusHistory.mockResolvedValue(mockHistory);

      const command = new ListSimStatusHistoryCommand();
      const result = await command.execute({ sim_id: '8981100000000000000' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.any(String),
          },
        ],
      });

      // @ts-expect-error - accessing text property for test
      const resultText = JSON.parse(result.content[0].text);
      expect(resultText.data.items).toHaveLength(3);
      expect(resultText.data.count).toBe(3);
      expect(mockClient.sim.listSimStatusHistory).toHaveBeenCalledWith('8981100000000000000', {
        limit: 10,
      });
    });

    it('should handle pagination parameters', async () => {
      mockClient.sim.listSimStatusHistory.mockResolvedValue([]);

      const command = new ListSimStatusHistoryCommand();
      await command.execute(
        {
          sim_id: '8981100000000000000',
          from: 1704067200000,
          to: 1704153600000,
          limit: 100,
          last_evaluated_key: 'next-page-key',
        },
        context,
      );

      expect(mockClient.sim.listSimStatusHistory).toHaveBeenCalledWith('8981100000000000000', {
        from: 1704067200000,
        to: 1704153600000,
        limit: 100,
        last_evaluated_key: 'next-page-key',
      });
    });

    it('should handle empty results', async () => {
      mockClient.sim.listSimStatusHistory.mockResolvedValue([]);

      const command = new ListSimStatusHistoryCommand();
      const result = await command.execute({ sim_id: '8981100000000000000' }, context);

      // @ts-expect-error - accessing text property for test
      const resultText = JSON.parse(result.content[0].text);
      expect(resultText.data.items).toHaveLength(0);
      expect(resultText.data.count).toBe(0);
    });

    it('should handle missing simId', async () => {
      const command = new ListSimStatusHistoryCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error'),
          },
        ],
      });
      expect(mockClient.sim.listSimStatusHistory).not.toHaveBeenCalled();
    });

    it('should handle SIM not found error', async () => {
      const error = new Error('SIM not found');
      mockClient.sim.listSimStatusHistory.mockRejectedValue(error);

      const command = new ListSimStatusHistoryCommand();
      const result = await command.execute({ sim_id: 'non-existent' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: SIM not found'),
          },
        ],
      });
    });

    it('should handle network errors', async () => {
      const error = new Error('Network timeout');
      mockClient.sim.listSimStatusHistory.mockRejectedValue(error);

      const command = new ListSimStatusHistoryCommand();
      const result = await command.execute({ sim_id: '8981100000000000000' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Network timeout'),
          },
        ],
      });
    });

    it('should handle missing credentials', async () => {
      const command = new ListSimStatusHistoryCommand();
      const invalidContext = {
        config: {
          authKeyId: '',
          authKeyToken: '',
          coverage: 'jp' as const,
        },
      };

      const result = await command.execute({ sim_id: '8981100000000000000' }, invalidContext);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('SORACOM credentials not configured'),
          },
        ],
      });
    });

    it('should handle various status transitions', async () => {
      const mockHistory: SimStatusHistory[] = [
        {
          status: 'ready',
          timestamp: 1704067200000,
          operatorId: 'OP1234567890',
        },
        {
          status: 'active',
          timestamp: 1704068000000,
          previousStatus: 'ready',
          operatorId: 'OP1234567890',
        },
        {
          status: 'inactive',
          timestamp: 1704069000000,
          previousStatus: 'active',
          operatorId: 'OP1234567890',
        },
        {
          status: 'standby',
          timestamp: 1704070000000,
          previousStatus: 'inactive',
          operatorId: 'OP1234567890',
        },
      ];
      mockClient.sim.listSimStatusHistory.mockResolvedValue(mockHistory);

      const command = new ListSimStatusHistoryCommand();
      const result = await command.execute({ sim_id: '8981100000000000000' }, context);

      // @ts-expect-error - accessing text property for test
      const resultText = JSON.parse(result.content[0].text);
      expect(resultText.data.items).toHaveLength(4);
      expect(resultText.data.items[0].status).toBe('ready');
      expect(resultText.data.items[1].status).toBe('active');
      expect(resultText.data.items[1].previousStatus).toBe('ready');
    });
  });
});
