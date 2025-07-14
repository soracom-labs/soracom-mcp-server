import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListGroupsCommand } from '../../../../src/commands/group/list-groups.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('ListGroupsCommand', () => {
  const mockClient = {
    group: {
      listGroups: vi.fn(),
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
    it('should list groups successfully', async () => {
      const mockGroups = [
        { groupId: 'group1', name: 'Test Group 1', tags: { env: 'dev' } },
        { groupId: 'group2', name: 'Test Group 2', tags: { env: 'prod' } },
      ];
      mockClient.group.listGroups.mockResolvedValue(mockGroups);

      const command = new ListGroupsCommand();
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
      expect(mockClient.group.listGroups).toHaveBeenCalledWith({ limit: 10 });
    });

    it('should apply tag filters correctly', async () => {
      const mockGroups = [{ groupId: 'group1', name: 'Test Group', tags: { env: 'prod' } }];
      mockClient.group.listGroups.mockResolvedValue(mockGroups);

      const command = new ListGroupsCommand();
      const args = {
        tag_name: 'env',
        tag_value: 'prod',
        tag_value_match_mode: 'exact' as const,
        limit: 10,
      };

      await command.execute(args, context);

      expect(mockClient.group.listGroups).toHaveBeenCalledWith({
        tag_name: 'env',
        tag_value: 'prod',
        tag_value_match_mode: 'exact',
        limit: 10,
      });
    });

    it('should handle empty results', async () => {
      mockClient.group.listGroups.mockResolvedValue([]);

      const command = new ListGroupsCommand();
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
      mockClient.group.listGroups.mockRejectedValue(error);

      const command = new ListGroupsCommand();
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
      const command = new ListGroupsCommand();
      const invalidArgs = {
        tag_value_match_mode: 'invalid-mode',
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
      const command = new ListGroupsCommand();
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
