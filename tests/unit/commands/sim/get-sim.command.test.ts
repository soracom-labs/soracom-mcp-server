import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSimCommand } from '../../../../src/commands/sim/get-sim.command.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';
import { CommandContext } from '../../../../src/lib/types.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetSimCommand', () => {
  const mockClient = {
    sim: {
      getSim: vi.fn(),
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
    it('should get SIM details successfully', async () => {
      const mockSim = {
        simId: '8981100000000000000',
        iccid: '8981100000000000000',
        msisdn: '020000000000',
        imsi: '440101234567890',
        name: 'Test SIM',
        status: 'active',
        speedClass: 's1.standard',
        createdAt: 1234567890000,
        tags: { env: 'production' },
      };
      mockClient.sim.getSim.mockResolvedValue(mockSim);

      const command = new GetSimCommand();
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
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data).toEqual(mockSim);
      expect(mockClient.sim.getSim).toHaveBeenCalledWith('8981100000000000000');
    });

    it('should handle missing simId', async () => {
      const command = new GetSimCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error'),
          },
        ],
        isError: true,
      });
      expect(mockClient.sim.getSim).not.toHaveBeenCalled();
    });

    it('should handle SIM not found error', async () => {
      const error = new Error('SIM not found');
      mockClient.sim.getSim.mockRejectedValue(error);

      const command = new GetSimCommand();
      const result = await command.execute({ sim_id: 'non-existent' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: SIM not found'),
          },
        ],
        isError: true,
      });
    });

    it('should validate SIM ID format', async () => {
      const command = new GetSimCommand();
      const result = await command.execute({ sim_id: 'invalid-id!' }, context);

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

    it('should handle network errors', async () => {
      const error = new Error('Network timeout');
      mockClient.sim.getSim.mockRejectedValue(error);

      const command = new GetSimCommand();
      const result = await command.execute({ sim_id: '8981100000000000000' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Network timeout'),
          },
        ],
        isError: true,
      });
    });
  });
});
