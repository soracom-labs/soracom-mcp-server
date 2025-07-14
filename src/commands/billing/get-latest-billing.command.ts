import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

export class GetLatestBillingCommand extends BaseCommand {
  name = 'Billing_getLatestBilling';
  description = 'Retrieves the preliminary usage fee for the current month';
  inputSchema = {
    type: 'object',
    properties: {},
  };

  protected async executeCommand(_args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const latestBilling = await client.billing.getLatestBilling();
    return this.formatSuccess(latestBilling);
  }
}
