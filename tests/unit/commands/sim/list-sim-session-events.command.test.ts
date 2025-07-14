import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListSimSessionEventsCommand } from '../../../../src/commands/sim/list-sim-session-events.command.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SimSessionEvent } from '../../../../src/api/types/sim.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('ListSimSessionEventsCommand', () => {
  const mockClient = {
    sim: {
      listSimSessionEvents: vi.fn(),
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
    it('should list session events successfully', async () => {
      const mockEvents: SimSessionEvent[] = [
        {
          event: 'Started',
          timestamp: 1704067200000,
          imsi: '440101234567890',
          sim_id: '8981100000000000000',
          operatorId: 'OP1234567890',
          properties: {
            location: 'Tokyo',
            ueIpAddress: '10.0.0.1',
          },
        },
        {
          event: 'Stopped',
          timestamp: 1704067800000,
          imsi: '440101234567890',
          sim_id: '8981100000000000000',
          operatorId: 'OP1234567890',
        },
      ];
      mockClient.sim.listSimSessionEvents.mockResolvedValue(mockEvents);

      const command = new ListSimSessionEventsCommand();
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
      expect(resultText.data.items).toHaveLength(2);
      expect(resultText.data.count).toBe(2);
      expect(mockClient.sim.listSimSessionEvents).toHaveBeenCalledWith('8981100000000000000', {
        limit: 10,
      });
    });

    it('should handle pagination parameters', async () => {
      mockClient.sim.listSimSessionEvents.mockResolvedValue([]);

      const command = new ListSimSessionEventsCommand();
      await command.execute(
        {
          sim_id: '8981100000000000000',
          from: 1704067200000,
          to: 1704153600000,
          limit: 50,
          last_evaluated_key: 'next-page-key',
        },
        context,
      );

      expect(mockClient.sim.listSimSessionEvents).toHaveBeenCalledWith('8981100000000000000', {
        from: 1704067200000,
        to: 1704153600000,
        limit: 50,
        last_evaluated_key: 'next-page-key',
      });
    });

    it('should handle empty results', async () => {
      mockClient.sim.listSimSessionEvents.mockResolvedValue([]);

      const command = new ListSimSessionEventsCommand();
      const result = await command.execute({ sim_id: '8981100000000000000' }, context);

      // @ts-expect-error - accessing text property for test
      const resultText = JSON.parse(result.content[0].text);
      expect(resultText.data.items).toHaveLength(0);
      expect(resultText.data.count).toBe(0);
    });

    it('should handle missing simId', async () => {
      const command = new ListSimSessionEventsCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error'),
          },
        ],
      });
      expect(mockClient.sim.listSimSessionEvents).not.toHaveBeenCalled();
    });

    it('should handle SIM not found error', async () => {
      const error = new Error('SIM not found');
      mockClient.sim.listSimSessionEvents.mockRejectedValue(error);

      const command = new ListSimSessionEventsCommand();
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
      mockClient.sim.listSimSessionEvents.mockRejectedValue(error);

      const command = new ListSimSessionEventsCommand();
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
      const command = new ListSimSessionEventsCommand();
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
  });
});
