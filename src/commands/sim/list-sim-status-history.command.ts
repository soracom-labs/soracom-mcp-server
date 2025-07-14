import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { ListSimStatusHistoryParams } from '../../api/types/sim.js';

const ListSimStatusHistorySchema = z.object({
  sim_id: z.string(),
  from: z.number().optional(),
  to: z.number().optional(),
  limit: z.number().optional(),
  last_evaluated_key: z.string().optional(),
});

export class ListSimStatusHistoryCommand extends BaseCommand {
  name = 'Sim_listSimStatusHistory';
  description = 'Get the status history for the specified SIM';

  inputSchema = {
    type: 'object',
    properties: {
      sim_id: {
        type: 'string',
        description: 'SIM ID of the target SIM',
      },
      from: {
        type: 'number',
        description:
          'Start time of the status operation history entry to be searched (UNIX time in milliseconds). If not specified, from is set to the oldest status operation history entry time',
      },
      to: {
        type: 'number',
        description:
          'End time of the status operation history entry to be searched (UNIX time in milliseconds). If not specified, to is set to the current time',
      },
      limit: {
        type: 'number',
        description:
          'Maximum number of items to retrieve in one request (1-100, default: 10). The response may contain fewer items than specified',
      },
      last_evaluated_key: {
        type: 'string',
        description:
          'A string for pagination consisting of the primary IMSI and timestamp of the last status operation history entry from the previous page',
      },
    },
    required: ['sim_id'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const { sim_id, last_evaluated_key, ...params } = ListSimStatusHistorySchema.parse(args);

    const queryParams: ListSimStatusHistoryParams = {};
    if (params.from !== undefined) queryParams.from = params.from;
    if (params.to !== undefined) queryParams.to = params.to;
    queryParams.limit = params.limit !== undefined ? params.limit : 10;
    if (last_evaluated_key !== undefined) queryParams.last_evaluated_key = last_evaluated_key;

    const history = await client.sim.listSimStatusHistory(sim_id, queryParams);
    return this.formatListResponse(history);
  }
}
