import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';

export class LogoutCommand extends BaseCommand {
  name = 'Auth_logout';
  description = 'Clear cached authentication tokens';
  inputSchema = {
    type: 'object',
    properties: {},
  };

  protected async executeCommand(_args: unknown, context?: CommandContext) {
    const client = await this.getAuthenticatedClient(context);
    await client.logout(context!.config.authKeyId);
    // The client will be removed from cache during logout

    return this.formatSuccess({
      message:
        'Authentication cache cleared. The system will automatically re-authenticate on the next API call.',
      note: 'You can continue to use all SORACOM API functions normally.',
    });
  }
}
