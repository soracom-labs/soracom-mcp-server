import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { z } from 'zod';

const GetAirStatsOfGroupArgsSchema = z.object({
  group_id: z.string().min(1, 'Group ID is required'),
  from: z.number().int().positive('From timestamp must be a positive number'),
  to: z.number().int().positive('To timestamp must be a positive number'),
  period: z.enum(['day', 'month'], {
    errorMap: () => ({ message: 'Period must be either "day" or "month"' }),
  }),
});

export class GetAirStatsOfGroupCommand extends BaseCommand {
  name = 'Stats_getAirStatsOfGroup';
  description = 'Retrieves the usage report for the specified group';
  inputSchema = {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The Group ID',
      },
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
    required: ['group_id', 'from', 'to', 'period'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const validatedArgs = GetAirStatsOfGroupArgsSchema.parse(args);
    const client = await this.getAuthenticatedClient(context);

    const stats = await client.stats.getAirStatsOfGroup({
      groupId: validatedArgs.group_id,
      from: validatedArgs.from,
      to: validatedArgs.to,
      period: validatedArgs.period,
    });

    return this.formatSuccess(stats);
  }
}
