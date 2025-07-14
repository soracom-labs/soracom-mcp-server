import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

export class GetBillingHistoryCommand extends BaseCommand {
  name = 'Billing_getBillingHistory';
  description = 'List all available finalized billing periods from the last 18 months.';
  inputSchema = {
    type: 'object',
    properties: {},
  };

  protected async executeCommand(_args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const billing = await client.billing.getBillingHistory();
    return this.formatSuccess(billing);
  }
}
