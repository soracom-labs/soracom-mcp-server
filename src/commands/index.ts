import { ToolCommand } from '../lib/types.js';

// Auth Commands
import { LogoutCommand } from './auth/logout.command.js';

// SIM Commands
import { ListSimsCommand } from './sim/list-sims.command.js';
import { GetSimCommand } from './sim/get-sim.command.js';
import { ListSimSessionEventsCommand } from './sim/list-sim-session-events.command.js';
import { ListSimStatusHistoryCommand } from './sim/list-sim-status-history.command.js';

// Query Commands
import { SearchSimsCommand } from './query/search-sims.command.js';

// Stats Commands
import { GetAirStatsOfSimCommand } from './stats/get-air-stats-of-sim.command.js';
import { GetAirStatsOfOperatorCommand } from './stats/get-air-stats-of-operator.command.js';
import { GetAirStatsOfGroupCommand } from './stats/get-air-stats-of-group.command.js';

// Group Commands
import { ListGroupsCommand } from './group/list-groups.command.js';
import { GetGroupCommand } from './group/get-group.command.js';

// Billing Commands
import { GetLatestBillingCommand } from './billing/get-latest-billing.command.js';
import { GetBillingHistoryCommand } from './billing/get-billing-history.command.js';
import { GetBillingCommand } from './billing/get-billing.command.js';
import { GetBillingSummaryOfBillItemsCommand } from './billing/get-billing-summary-of-bill-items.command.js';
import { GetBillingSummaryOfSimsCommand } from './billing/get-billing-summary-of-sims.command.js';

// CellLocation Commands
import { BatchGetCellLocationsCommand } from './cell-location/batch-get-cell-locations.command.js';

export const commands = new Map<string, ToolCommand>([
  // Auth Commands
  ['Auth_logout', new LogoutCommand()],

  // SIM Commands
  ['Sim_listSims', new ListSimsCommand()],
  ['Sim_getSim', new GetSimCommand()],
  ['Sim_listSimSessionEvents', new ListSimSessionEventsCommand()],
  ['Sim_listSimStatusHistory', new ListSimStatusHistoryCommand()],

  // Query Commands
  ['Query_searchSims', new SearchSimsCommand()],

  // Stats Commands
  ['Stats_getAirStatsOfSim', new GetAirStatsOfSimCommand()],
  ['Stats_getAirStatsOfOperator', new GetAirStatsOfOperatorCommand()],
  ['Stats_getAirStatsOfGroup', new GetAirStatsOfGroupCommand()],

  // Group Commands
  ['Group_listGroups', new ListGroupsCommand()],
  ['Group_getGroup', new GetGroupCommand()],

  // Billing Commands
  ['Billing_getLatestBilling', new GetLatestBillingCommand()],
  ['Billing_getBillingHistory', new GetBillingHistoryCommand()],
  ['Billing_getBilling', new GetBillingCommand()],
  ['Billing_getBillingSummaryOfBillItems', new GetBillingSummaryOfBillItemsCommand()],
  ['Billing_getBillingSummaryOfSims', new GetBillingSummaryOfSimsCommand()],

  // CellLocation Commands
  ['CellLocation_batchGetCellLocations', new BatchGetCellLocationsCommand()],
]);

export function getCommand(name: string): ToolCommand | undefined {
  // First try direct lookup (for backward compatibility)
  const directCommand = commands.get(name);
  if (directCommand) {
    return directCommand;
  }

  // Otherwise search by command.name property
  for (const command of commands.values()) {
    if (command.name === name) {
      return command;
    }
  }

  return undefined;
}

export function getAllCommands(): ToolCommand[] {
  return Array.from(commands.values());
}
