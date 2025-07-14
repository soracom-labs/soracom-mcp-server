import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

export class GetBillingSummaryOfSimsCommand extends BaseCommand {
  name = 'Billing_getBillingSummaryOfSims';
  description =
    'Get a billing summary of SIMs for the last 4 months (current month to 3 months ago). List of cost breakdown. The list is sorted by amount in descending order, and include up to 100 items.';
  inputSchema = {
    type: 'object',
    properties: {},
  };

  protected async executeCommand(_args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const summary = await client.billing.getBillingSummaryOfSims();
    return this.formatListResponse(summary);
  }
}
