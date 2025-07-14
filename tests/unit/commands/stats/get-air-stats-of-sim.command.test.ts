import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAirStatsOfSimCommand } from '../../../../src/commands/stats/get-air-stats-of-sim.command.js';
import { mockSoracomClient, createMockContext } from '../../../utils/test-helpers.js';

describe('GetAirStatsOfSimCommand', () => {
  let command: GetAirStatsOfSimCommand;
  const mockContext = createMockContext();

  beforeEach(() => {
    command = new GetAirStatsOfSimCommand();
    vi.clearAllMocks();
  });

  describe('command properties', () => {
    it('should have correct name with category prefix', () => {
      expect(command.name).toBe('Stats_getAirStatsOfSim');
    });

    it('should require sim_id, from, to and period parameters', () => {
      expect(command.inputSchema.required).toEqual(['sim_id', 'from', 'to', 'period']);
    });
  });

  describe('execute', () => {
    it('should execute successfully with valid parameters', async () => {
      const mockStats = {
        period: 'day',
        data: [{ timestamp: 1640995200, downloadBytes: 1000, uploadBytes: 500 }],
      };

      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfSim.mockResolvedValue(mockStats);

      const result = await command.execute(
        {
          sim_id: 'test-sim-id',
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.content[0].text).toContain('"period": "day"');
      expect(result.content[0].text).toContain('"downloadBytes": 1000');
      expect(mockClient.stats.getAirStatsOfSim).toHaveBeenCalledWith({
        simId: 'test-sim-id',
        from: 1640995200,
        to: 1641081600,
        period: 'day',
      });
    });

    it('should validate required period parameter', async () => {
      const result = await command.execute(
        {
          sim_id: 'test-sim-id',
          from: 1640995200,
          to: 1641081600,
          // missing period parameter
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Required');
    });

    it('should validate required parameters', async () => {
      const result = await command.execute(
        {
          from: 1640995200,
          to: 1641081600,
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Required');
    });

    it('should validate period enum values', async () => {
      const result = await command.execute(
        {
          sim_id: 'test-sim-id',
          from: 1640995200,
          to: 1641081600,
          period: 'invalid',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
    });

    it('should work with minutes period', async () => {
      const mockStats = {
        period: 'minutes',
        data: [{ timestamp: 1640995200, downloadBytes: 500, uploadBytes: 250 }],
      };

      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfSim.mockResolvedValue(mockStats);

      const result = await command.execute(
        {
          sim_id: 'test-sim-id',
          from: 1640995200,
          to: 1641081600,
          period: 'minutes',
        },
        mockContext,
      );

      expect(result.content[0].text).toContain('"period": "minutes"');
      expect(result.content[0].text).toContain('"downloadBytes": 500');
      expect(mockClient.stats.getAirStatsOfSim).toHaveBeenCalledWith({
        simId: 'test-sim-id',
        from: 1640995200,
        to: 1641081600,
        period: 'minutes',
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfSim.mockRejectedValue(new Error('API Error'));

      const result = await command.execute(
        {
          sim_id: 'test-sim-id',
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('API Error');
    });
  });
});
