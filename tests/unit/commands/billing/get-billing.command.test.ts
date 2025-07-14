import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetBillingCommand } from '../../../../src/commands/billing/get-billing.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetBillingCommand', () => {
  const mockClient = {
    billing: {
      getBilling: vi.fn(),
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
    it('should get billing for specific month successfully', async () => {
      const mockBilling = {
        totalAmount: 1000,
        currency: 'JPY',
        details: [
          { service: 'data', amount: 800 },
          { service: 'sms', amount: 200 },
        ],
      };
      mockClient.billing.getBilling.mockResolvedValue(mockBilling);

      const command = new GetBillingCommand();
      const result = await command.execute({ yearMonth: '202412' }, context);

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
      expect(parsed.data.yearMonth).toBe('202412');
      expect(parsed.data.billing).toEqual(mockBilling);
      expect(mockClient.billing.getBilling).toHaveBeenCalledWith({ billing_year_month: '202412' });
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Billing data not available');
      mockClient.billing.getBilling.mockRejectedValue(error);

      const command = new GetBillingCommand();
      const result = await command.execute({ yearMonth: '202412' }, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Billing data not available'),
          },
        ],
        isError: true,
      });
    });

    it('should validate input schema', async () => {
      const command = new GetBillingCommand();
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

    it('should handle missing credentials', async () => {
      const command = new GetBillingCommand();
      const invalidContext = {
        config: {
          authKeyId: '',
          authKeyToken: '',
          coverage: 'jp' as const,
        },
      };

      const result = await command.execute({ yearMonth: '202412' }, invalidContext);

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
