import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetGroupCommand } from '../../../../src/commands/group/get-group.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetGroupCommand', () => {
  const mockClient = {
    group: {
      getGroup: vi.fn(),
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
    it('should get group successfully', async () => {
      const mockGroup = {
        groupId: 'group123',
        name: 'Test Group',
        tags: { env: 'production' },
        configuration: { airMetadata: { enabled: true } },
      };
      mockClient.group.getGroup.mockResolvedValue(mockGroup);

      const command = new GetGroupCommand();
      const result = await command.execute({ group_id: 'group123' }, context);

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
      expect(parsed.data).toEqual(mockGroup);
      expect(mockClient.group.getGroup).toHaveBeenCalledWith('group123');
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Group not found');
      mockClient.group.getGroup.mockRejectedValue(error);

      const command = new GetGroupCommand();
      const result = await command.execute({ group_id: 'nonexistent' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Group not found'),
          },
        ],
        isError: true,
      });
    });

    it('should validate input schema', async () => {
      const command = new GetGroupCommand();
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
    });

    it('should handle empty groupId', async () => {
      const command = new GetGroupCommand();
      const result = await command.execute({ group_id: '' }, context);

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
      const command = new GetGroupCommand();
      const invalidContext = {
        config: {
          authKeyId: '',
          authKeyToken: '',
          coverage: 'jp' as const,
        },
      };

      const result = await command.execute({ group_id: 'group123' }, invalidContext);

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
