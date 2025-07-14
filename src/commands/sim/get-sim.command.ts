import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

const GetSimSchema = z.object({
  sim_id: z.string(),
});

export class GetSimCommand extends BaseCommand {
  name = 'Sim_getSim';
  description = 'Get detailed information about a specific IoT SIM';
  inputSchema = {
    type: 'object',
    properties: {
      sim_id: {
        type: 'string',
        description: 'SIM ID of the target SIM',
      },
    },
    required: ['sim_id'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    const { sim_id } = GetSimSchema.parse(args);
    const sim = await client.sim.getSim(sim_id);
    return this.formatSuccess(sim);
  }
}
