import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { z } from 'zod';

const GetGroupArgsSchema = z.object({
  group_id: z.string().min(1, 'Group ID is required'),
});

export class GetGroupCommand extends BaseCommand {
  name = 'Group_getGroup';
  description = 'Get information about a specific group';
  inputSchema = {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'ID of the target Group',
      },
    },
    required: ['group_id'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const { group_id } = GetGroupArgsSchema.parse(args);
    const client = await this.getAuthenticatedClient(context);

    const group = await client.group.getGroup(group_id);

    return this.formatSuccess(group);
  }
}
