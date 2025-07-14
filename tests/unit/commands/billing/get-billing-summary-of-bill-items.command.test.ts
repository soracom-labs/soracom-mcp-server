import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetBillingSummaryOfBillItemsCommand } from '../../../../src/commands/billing/get-billing-summary-of-bill-items.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetBillingSummaryOfBillItemsCommand', () => {
  const mockClient = {
    billing: {
      getBillingSummaryOfBillItems: vi.fn(),
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
    it('should get billing summary of bill items successfully', async () => {
      const mockSummary = [
        { service: 'data', amount: 800, currency: 'JPY' },
        { service: 'sms', amount: 200, currency: 'JPY' },
      ];
      mockClient.billing.getBillingSummaryOfBillItems.mockResolvedValue(mockSummary);

      const command = new GetBillingSummaryOfBillItemsCommand();
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
      expect(parsed.data.items).toEqual(mockSummary);
      expect(mockClient.billing.getBillingSummaryOfBillItems).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Billing summary not available');
      mockClient.billing.getBillingSummaryOfBillItems.mockRejectedValue(error);

      const command = new GetBillingSummaryOfBillItemsCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Billing summary not available'),
          },
        ],
        isError: true,
      });
    });

    it('should handle missing credentials', async () => {
      const command = new GetBillingSummaryOfBillItemsCommand();
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
