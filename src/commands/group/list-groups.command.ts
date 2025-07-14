import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { z } from 'zod';
import { API_LIMITS } from '../../lib/constants.js';

const ListGroupsArgsSchema = z.object({
  tag_name: z.string().optional(),
  tag_value: z.string().optional(),
  tag_value_match_mode: z.enum(['exact', 'prefix']).optional(),
  limit: z.number().int().min(1).max(API_LIMITS.MAX_GROUP_LIST_LIMIT).optional(),
  lastEvaluatedKey: z.string().optional(),
});

export class ListGroupsCommand extends BaseCommand {
  name = 'Group_listGroups';
  description = 'Return a list of groups';
  inputSchema = {
    type: 'object',
    properties: {
      tag_name: {
        type: 'string',
        description:
          'Tag name of the group. Filters through all groups that exactly match the tag name. When tag_name is specified, tag_value is required',
      },
      tag_value: {
        type: 'string',
        description: 'Tag value of the groups',
      },
      tag_value_match_mode: {
        type: 'string',
        enum: ['exact', 'prefix'],
        description: 'Search criteria for tag strings (exact or prefix, default: exact)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results per response page (default: 10)',
      },
      lastEvaluatedKey: {
        type: 'string',
        description:
          'The last Group ID retrieved on the current page. Specify this to continue from the next group onward',
      },
    },
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const validatedArgs = ListGroupsArgsSchema.parse(args);
    const client = await this.getAuthenticatedClient(context);

    // Set default limit to 10 if not specified
    const requestArgs = {
      ...validatedArgs,
      limit: validatedArgs.limit !== undefined ? validatedArgs.limit : 10,
    };

    const groups = await client.group.listGroups(requestArgs);

    return this.formatListResponse(groups, {
      totalCount: groups.length,
      hasMore: requestArgs.limit ? groups.length === requestArgs.limit : false,
    });
  }
}
