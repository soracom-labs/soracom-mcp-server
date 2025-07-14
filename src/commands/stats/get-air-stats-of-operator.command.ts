import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

const GetAirStatsOfOperatorSchema = z.object({
  from: z.number(),
  to: z.number(),
  period: z.enum(['day', 'month']),
});

export class GetAirStatsOfOperatorCommand extends BaseCommand {
  name = 'Stats_getAirStatsOfOperator';
  description = 'Get data usage statistics for Air service';
  inputSchema = {
    type: 'object',
    properties: {
      from: {
        type: 'number',
        description:
          'Start date in UNIX timestamp (seconds). day: subtract up to 604800 seconds (7 days). month: subtract up to 7776000 seconds (3 months). Use Math.floor(Date.now() / 1000) - seconds_to_subtract.',
      },
      to: {
        type: 'number',
        description:
          'End date in UNIX timestamp (seconds). Use current timestamp: Math.floor(Date.now() / 1000)',
      },
      period: {
        type: 'string',
        enum: ['day', 'month'],
        description:
          'Unit of aggregation. Recommended: start with "month" for broader overview. day: Daily data (recent days), month: Monthly data (recent months)',
      },
    },
    required: ['from', 'to', 'period'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const params = GetAirStatsOfOperatorSchema.parse(args);

    const stats = await client.stats.getAirStatsOfOperator({
      from: params.from,
      to: params.to,
      period: params.period,
    });
    return this.formatSuccess(stats);
  }
}
