import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchSimsCommand } from '../../../../src/commands/query/search-sims.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('SearchSimsCommand', () => {
  const mockClient = {
    query: {
      searchSims: vi.fn(),
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
    it('should search SIMs using searchTerm (special behavior)', async () => {
      const mockSims = [
        { simId: '123', name: 'Test SIM 1', iccid: 'hoge12345' },
        { simId: '456', name: 'Test SIM 2', imsi: 'hoge67890' },
      ];
      mockClient.query.searchSims.mockResolvedValue(mockSims);

      const command = new SearchSimsCommand();
      const result = await command.execute({ searchTerm: 'hoge' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.any(String),
          },
        ],
      });

      // Verify searchTerm expands to multiple fields with OR logic and default limit
      expect(mockClient.query.searchSims).toHaveBeenCalledWith({
        name: 'hoge',
        group: 'hoge',
        imsi: 'hoge',
        msisdn: 'hoge',
        iccid: 'hoge',
        serial_number: 'hoge',
        sim_id: 'hoge',
        tag: 'hoge',
        search_type: 'or',
        limit: 10,
      });
    });

    it('should search SIMs using specific fields with explicit search_type', async () => {
      const mockSims = [{ simId: '123', name: 'Test SIM', status: 'active' }];
      mockClient.query.searchSims.mockResolvedValue(mockSims);

      const command = new SearchSimsCommand();
      const result = await command.execute(
        {
          name: 'Test',
          status: 'active',
          search_type: 'and',
        },
        context,
      );

      expect(mockClient.query.searchSims).toHaveBeenCalledWith({
        name: 'Test',
        status: 'active',
        search_type: 'and',
        limit: 10,
      });

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(1);
    });

    it('should default to AND logic for multiple specific fields', async () => {
      const mockSims = [{ simId: '123', subscription: 'plan-D', session_status: 'ONLINE' }];
      mockClient.query.searchSims.mockResolvedValue(mockSims);

      const command = new SearchSimsCommand();
      const result = await command.execute(
        {
          subscription: 'plan-D',
          session_status: 'ONLINE',
          // No search_type specified - should default to 'and'
        },
        context,
      );

      expect(mockClient.query.searchSims).toHaveBeenCalledWith({
        subscription: 'plan-D',
        session_status: 'ONLINE',
        search_type: 'and',
        limit: 10,
      });

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(1);
    });

    it('should handle empty search results', async () => {
      mockClient.query.searchSims.mockResolvedValue([]);

      const command = new SearchSimsCommand();
      const result = await command.execute({ searchTerm: 'notfound' }, context);

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Search failed');
      mockClient.query.searchSims.mockRejectedValue(error);

      const command = new SearchSimsCommand();
      const result = await command.execute({ searchTerm: 'test' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Search failed'),
          },
        ],
        isError: true,
      });
    });

    it('should validate input schema', async () => {
      const command = new SearchSimsCommand();
      const invalidArgs = {
        session_status: 'INVALID_STATUS',
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
      const command = new SearchSimsCommand();
      const invalidContext = {
        config: {
          authKeyId: '',
          authKeyToken: '',
          coverage: 'jp' as const,
        },
      };

      const result = await command.execute({ searchTerm: 'test' }, invalidContext);

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
