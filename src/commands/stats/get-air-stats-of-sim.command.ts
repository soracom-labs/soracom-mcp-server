import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

const GetAirStatsOfSimSchema = z.object({
  sim_id: z.string(),
  from: z.number(),
  to: z.number(),
  period: z.enum(['minutes', 'day', 'month']),
});

export class GetAirStatsOfSimCommand extends BaseCommand {
  name = 'Stats_getAirStatsOfSim';
  description = 'Retrieve the usage report for the subscriber specified by the SIM ID';
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
          'Start date in UNIX timestamp (seconds). minutes: subtract up to 2764800 seconds (32 days). day: subtract up to 46656000 seconds (18 months). month: subtract up to 46656000 seconds (18 months). Use Math.floor(Date.now() / 1000) - seconds_to_subtract.',
      },
      to: {
        type: 'number',
        description:
          'End date in UNIX timestamp (seconds). Use current timestamp: Math.floor(Date.now() / 1000)',
      },
      period: {
        type: 'string',
        enum: ['minutes', 'day', 'month'],
        description:
          'Unit of aggregation. Recommended: start with "month" for broader overview. minutes: Minute-level data (recent hours), day: Daily data (recent days), month: Monthly data (recent months)',
      },
    },
    required: ['sim_id', 'from', 'to', 'period'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const params = GetAirStatsOfSimSchema.parse(args);

    const stats = await client.stats.getAirStatsOfSim({
      simId: params.sim_id,
      from: params.from,
      to: params.to,
      period: params.period,
    });
    return this.formatSuccess(stats);
  }
}
