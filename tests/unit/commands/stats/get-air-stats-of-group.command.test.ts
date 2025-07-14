import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAirStatsOfGroupCommand } from '../../../../src/commands/stats/get-air-stats-of-group.command.js';
import { mockSoracomClient, createMockContext } from '../../../utils/test-helpers.js';

describe('GetAirStatsOfGroupCommand', () => {
  let command: GetAirStatsOfGroupCommand;
  const mockContext = createMockContext();

  beforeEach(() => {
    command = new GetAirStatsOfGroupCommand();
    vi.clearAllMocks();
  });

  describe('command properties', () => {
    it('should have correct name with category prefix', () => {
      expect(command.name).toBe('Stats_getAirStatsOfGroup');
    });

    it('should require all parameters including period', () => {
      expect(command.inputSchema.required).toEqual(['group_id', 'from', 'to', 'period']);
    });
  });

  describe('execute', () => {
    it('should execute successfully with valid parameters', async () => {
      const mockStats = {
        period: 'day',
        data: [{ timestamp: 1640995200, downloadBytes: 10000, uploadBytes: 5000 }],
      };

      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfGroup.mockResolvedValue(mockStats);

      const result = await command.execute(
        {
          group_id: 'test-group-id',
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.content[0].text).toContain('"period": "day"');
      expect(result.content[0].text).toContain('"downloadBytes": 10000');
      expect(mockClient.stats.getAirStatsOfGroup).toHaveBeenCalledWith({
        groupId: 'test-group-id',
        from: 1640995200,
        to: 1641081600,
        period: 'day',
      });
    });

    it('should work with monthly period', async () => {
      const mockStats = { period: 'month', data: [] };
      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfGroup.mockResolvedValue(mockStats);

      await command.execute(
        {
          group_id: 'test-group-id',
          from: 1640995200,
          to: 1641081600,
          period: 'month',
        },
        mockContext,
      );

      expect(mockClient.stats.getAirStatsOfGroup).toHaveBeenCalledWith({
        groupId: 'test-group-id',
        from: 1640995200,
        to: 1641081600,
        period: 'month',
      });
    });

    it('should validate required groupId parameter', async () => {
      const result = await command.execute(
        {
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Required');
    });

    it('should validate required period parameter', async () => {
      const result = await command.execute(
        {
          group_id: 'test-group-id',
          from: 1640995200,
          to: 1641081600,
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Period must be either');
    });

    it('should validate period enum values', async () => {
      const result = await command.execute(
        {
          group_id: 'test-group-id',
          from: 1640995200,
          to: 1641081600,
          period: 'week',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Period must be either');
    });

    it('should validate positive timestamps', async () => {
      const result = await command.execute(
        {
          group_id: 'test-group-id',
          from: -1,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('From timestamp must be a positive number');
    });

    it('should validate empty groupId', async () => {
      const result = await command.execute(
        {
          group_id: '',
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Group ID is required');
    });

    it('should handle API errors gracefully', async () => {
      const mockClient = mockSoracomClient();
      mockClient.stats.getAirStatsOfGroup.mockRejectedValue(new Error('Group not found'));

      const result = await command.execute(
        {
          group_id: 'invalid-group-id',
          from: 1640995200,
          to: 1641081600,
          period: 'day',
        },
        mockContext,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Group not found');
    });
  });
});
