import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetBillingSummaryOfSimsCommand } from '../../../../src/commands/billing/get-billing-summary-of-sims.command.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('GetBillingSummaryOfSimsCommand', () => {
  const mockClient = {
    billing: {
      getBillingSummaryOfSims: vi.fn(),
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
    it('should get billing summary of SIMs successfully', async () => {
      const mockSummary = [
        { simId: 'sim1', amount: 500, currency: 'JPY' },
        { simId: 'sim2', amount: 300, currency: 'JPY' },
      ];
      mockClient.billing.getBillingSummaryOfSims.mockResolvedValue(mockSummary);

      const command = new GetBillingSummaryOfSimsCommand();
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
      expect(mockClient.billing.getBillingSummaryOfSims).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('SIM billing summary not available');
      mockClient.billing.getBillingSummaryOfSims.mockRejectedValue(error);

      const command = new GetBillingSummaryOfSimsCommand();
      const result = await command.execute({}, context);

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: SIM billing summary not available'),
          },
        ],
        isError: true,
      });
    });

    it('should handle missing credentials', async () => {
      const command = new GetBillingSummaryOfSimsCommand();
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
