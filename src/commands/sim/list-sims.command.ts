import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

const ListSimsSchema = z.object({
  limit: z.number().optional(),
  lastEvaluatedKey: z.string().optional(),
});

export class ListSimsCommand extends BaseCommand {
  name = 'Sim_listSims';
  description =
    'List all IoT SIM cards in your account. Returns paginated results with SIM details';
  inputSchema = {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of SIMs to return (default: 10)',
      },
      lastEvaluatedKey: {
        type: 'string',
        description:
          'The ID of the last SIM retrieved on the previous page. Specify this to continue from the next SIM onward',
      },
    },
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const params = ListSimsSchema.parse(args);

    // Transform camelCase to snake_case for API
    const apiParams: Record<string, unknown> = {};
    // Set default limit to 10 if not specified
    apiParams['limit'] = params.limit !== undefined ? params.limit : 10;
    if (params.lastEvaluatedKey !== undefined) {
      apiParams['last_evaluated_key'] = params.lastEvaluatedKey;
    }

    const sims = await client.sim.listSims(apiParams);

    return this.formatListResponse(sims);
  }
}
