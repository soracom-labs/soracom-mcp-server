import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAirStatsOfOperatorCommand } from '../../../../src/commands/stats/get-air-stats-of-operator.command.js';
import { mockSoracomClient, createMockContext } from '../../../utils/test-helpers.js';

describe('GetAirStatsOfOperatorCommand', () => {
  let command: GetAirStatsOfOperatorCommand;
  const mockContext = createMockContext();

  beforeEach(() => {
    command = new GetAirStatsOfOperatorCommand();
    vi.clearAllMocks();
  });

  describe('command properties', () => {
    it('should have correct name with category prefix', () => {
      expect(command.name).toBe('Stats_getAirStatsOfOperator');
    });

    it('should require from, to and period parameters', () => {
      expect(command.inputSchema.required).toEqual(['from', 'to', 'period']);
    });
  });

  describe('execute', () => {
    it('should execute successfully with valid parameters', async () => {
      const mockStats = {
        period: 'day',
        data: [{ timestamp: 1640995200, downloadBytes: 5000, uploadBytes: 2500 }],
      };

      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfOperator.mockResolvedValue(mockStats);

      const result = await command.execute(
        {
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.content[0].text).toContain('"period": "day"');
      expect(result.content[0].text).toContain('"downloadBytes": 5000');
      expect(mockClient.stats.getAirStatsOfOperator).toHaveBeenCalledWith({
        from: 1640995200,
        to: 1641081600,
        period: 'day',
      });
    });

    it('should validate required period parameter', async () => {
      const result = await command.execute(
        {
          from: 1640995200,
          to: 1641081600,
          // missing period parameter
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Required');
    });

    it('should work with monthly period', async () => {
      const mockStats = { period: 'month', data: [] };
      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfOperator.mockResolvedValue(mockStats);

      await command.execute(
        {
          from: 1640995200,
          to: 1641081600,
          period: 'month',
        },
        mockContext,
      );

      expect(mockClient.stats.getAirStatsOfOperator).toHaveBeenCalledWith({
        from: 1640995200,
        to: 1641081600,
        period: 'month',
      });
    });

    it('should validate required parameters', async () => {
      const result = await command.execute(
        {
          from: 1640995200,
          // missing 'to' parameter
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Required');
    });

    it('should validate period enum values', async () => {
      const result = await command.execute(
        {
          from: 1640995200,
          to: 1641081600,
          period: 'hour',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfOperator.mockRejectedValue(new Error('API Error'));

      const result = await command.execute(
        {
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
