import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

export class GetBillingSummaryOfBillItemsCommand extends BaseCommand {
  name = 'Billing_getBillingSummaryOfBillItems';
  description =
    'Get a billing summary of bill items for the last 4 months (this month to 3 months ago). Shows charges categorized by services.';
  inputSchema = {
    type: 'object',
    properties: {},
  };

  protected async executeCommand(_args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const summary = await client.billing.getBillingSummaryOfBillItems();
    return this.formatListResponse(summary);
  }
}
