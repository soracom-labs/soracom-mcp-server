import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetLatestBillingCommand } from '../../../../src/commands/billing/get-latest-billing.command.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';
import { CommandContext } from '../../../../src/lib/types.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetLatestBillingCommand', () => {
  const mockClient = {
    billing: {
      getLatestBilling: vi.fn(),
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
    it('should get latest billing successfully', async () => {
      const mockBilling = {
        amount: 5280,
        currency: 'JPY',
        yearMonth: '202501',
      };
      mockClient.billing.getLatestBilling.mockResolvedValue(mockBilling);

      const command = new GetLatestBillingCommand();
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
      expect(parsed.data).toEqual(mockBilling);
      expect(mockClient.billing.getLatestBilling).toHaveBeenCalled();
    });

    it('should handle zero billing amount', async () => {
      const mockBilling = {
        amount: 0,
        currency: 'JPY',
        yearMonth: '202501',
      };
      mockClient.billing.getLatestBilling.mockResolvedValue(mockBilling);

      const command = new GetLatestBillingCommand();
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
      expect(parsed.data.amount).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Billing not available');
      mockClient.billing.getLatestBilling.mockRejectedValue(error);

      const command = new GetLatestBillingCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Billing not available'),
          },
        ],
        isError: true,
      });
    });

    it('should handle unauthorized error', async () => {
      const error = new Error('Unauthorized: Invalid credentials');
      mockClient.billing.getLatestBilling.mockRejectedValue(error);

      const command = new GetLatestBillingCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Unauthorized'),
          },
        ],
        isError: true,
      });
    });

    it('should handle missing credentials', async () => {
      const command = new GetLatestBillingCommand();
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

    it('should format large amounts correctly', async () => {
      const mockBilling = {
        amount: 1234567,
        currency: 'JPY',
        yearMonth: '202501',
      };
      mockClient.billing.getLatestBilling.mockResolvedValue(mockBilling);

      const command = new GetLatestBillingCommand();
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
      expect(parsed.data.amount).toBe(1234567);
    });
  });
});
