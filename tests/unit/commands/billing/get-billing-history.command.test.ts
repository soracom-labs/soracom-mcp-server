import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetBillingHistoryCommand } from '../../../../src/commands/billing/get-billing-history.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetBillingHistoryCommand', () => {
  const mockClient = {
    billing: {
      getBillingHistory: vi.fn(),
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
    it('should get billing history successfully', async () => {
      const mockHistory = [
        { yearMonth: '202412', amount: 1000, currency: 'JPY' },
        { yearMonth: '202411', amount: 1500, currency: 'JPY' },
      ];
      mockClient.billing.getBillingHistory.mockResolvedValue(mockHistory);

      const command = new GetBillingHistoryCommand();
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
      expect(parsed.data).toEqual(mockHistory);
      expect(mockClient.billing.getBillingHistory).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Billing history not available');
      mockClient.billing.getBillingHistory.mockRejectedValue(error);

      const command = new GetBillingHistoryCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Billing history not available'),
          },
        ],
        isError: true,
      });
    });

    it('should handle missing credentials', async () => {
      const command = new GetBillingHistoryCommand();
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
