import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { ListSimSessionEventsParams } from '../../api/types/sim.js';

const ListSimSessionEventsSchema = z.object({
  sim_id: z.string(),
  from: z.number().optional(),
  to: z.number().optional(),
  limit: z.number().optional(),
  last_evaluated_key: z.string().optional(),
});

export class ListSimSessionEventsCommand extends BaseCommand {
  name = 'Sim_listSimSessionEvents';
  description = 'Retrieve session event history for a specific SIM';

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
          'Start time (UNIX time in milliseconds) of the period to retrieve the session event history',
      },
      to: {
        type: 'number',
        description:
          'End time (UNIX time in milliseconds) of the period to retrieve the session event history',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of event histories to retrieve (default: 10)',
      },
      last_evaluated_key: {
        type: 'string',
        description:
          'The timestamp of the last event history retrieved on the previous page. Specify this to retrieve from the next event history',
      },
    },
    required: ['sim_id'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const { sim_id, last_evaluated_key, ...params } = ListSimSessionEventsSchema.parse(args);

    const queryParams: ListSimSessionEventsParams = {};
    if (params.from !== undefined) queryParams.from = params.from;
    if (params.to !== undefined) queryParams.to = params.to;
    queryParams.limit = params.limit !== undefined ? params.limit : 10;
    if (last_evaluated_key !== undefined) queryParams.last_evaluated_key = last_evaluated_key;

    const events = await client.sim.listSimSessionEvents(sim_id, queryParams);
    return this.formatListResponse(events);
  }
}
