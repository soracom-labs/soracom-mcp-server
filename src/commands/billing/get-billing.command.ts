import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

const GetBillingSchema = z.object({
  yearMonth: z.string(),
});

export class GetBillingCommand extends BaseCommand {
  name = 'Billing_getBilling';
  description =
    'Gets a finalized past billing history for the specified month. Returns complete billing details including charges by service type.';
  inputSchema = {
    type: 'object',
    properties: {
      yearMonth: {
        type: 'string',
        description: 'Billing year-month (YYYYMM format)',
      },
    },
    required: ['yearMonth'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const { yearMonth } = GetBillingSchema.parse(args);
    const billing = await client.billing.getBilling({ billing_year_month: yearMonth });
    return this.formatSuccess({
      yearMonth,
      billing,
      message: 'Billing data retrieved successfully',
    });
  }
}
