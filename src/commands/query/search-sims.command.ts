import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { SearchSimsParams } from '../../api/types/sim.js';
import { z } from 'zod';
import { API_LIMITS } from '../../lib/constants.js';

// Example usage:
// 1. General search when field is unknown: { "searchTerm": "hoge", "limit": 100 }
// 2. Name search: { "name": "hoge", "limit": 100 }
// 3. Serial number search: { "serial_number": "123456", "limit": 50 }
// 4. Complex search: { "subscription": "plan-D", "status": "active", "search_type": "and" }
const SearchSimsArgsSchema = z.object({
  // Special parameter for general search
  searchTerm: z.string().optional(),

  // Specific field searches
  name: z.string().optional(),
  group: z.string().optional(),
  group_id: z.string().optional(),
  sim_id: z.string().optional(),
  imsi: z.string().optional(),
  msisdn: z.string().optional(),
  iccid: z.string().optional(),
  serial_number: z.string().optional(),
  tag: z.string().optional(),
  status: z.string().optional(),
  session_status: z.enum(['NA', 'ONLINE', 'OFFLINE']).optional(),
  subscription: z.string().optional(),
  module_type: z.string().optional(),
  bundles: z.string().optional(),

  // Search behavior
  search_type: z.enum(['and', 'or']).optional(),

  // Pagination
  limit: z.number().int().min(1).max(API_LIMITS.MAX_SIM_SEARCH_LIMIT).optional(),
  last_evaluated_key: z.string().optional(),
});

export class SearchSimsCommand extends BaseCommand {
  name = 'Query_searchSims';
  description =
    'Search for IoT SIM cards using flexible criteria. Use "searchTerm" for general search across all fields (name, ICCID, IMSI, etc.) or use specific field parameters for targeted search. Supports AND/OR logic. Examples: {"searchTerm": "tokyo", "limit": 100} searches all fields, {"status": "active", "subscription": "plan-D"} finds active SIMs with specific plan';
  inputSchema = {
    type: 'object',
    properties: {
      searchTerm: {
        type: 'string',
        description:
          'SPECIAL: Use this when you don\'t know which specific field to search. This searches across name, group, imsi, msisdn, iccid, serial_number, sim_id, and tag fields simultaneously. Example: "hoge"',
      },
      name: {
        type: 'string',
        description: 'Search by SIM name',
      },
      group: {
        type: 'string',
        description: 'Search by group name',
      },
      group_id: {
        type: 'string',
        description: 'Search by group ID',
      },
      sim_id: {
        type: 'string',
        description: 'Search by SIM ID',
      },
      imsi: {
        type: 'string',
        description: 'Search by IMSI',
      },
      msisdn: {
        type: 'string',
        description: 'Search by MSISDN',
      },
      iccid: {
        type: 'string',
        description: 'Search by ICCID',
      },
      serial_number: {
        type: 'string',
        description: 'Search by serial number',
      },
      tag: {
        type: 'string',
        description: 'Search by tag values',
      },
      status: {
        type: 'string',
        description: 'Filter by SIM status',
      },
      session_status: {
        type: 'string',
        enum: ['NA', 'ONLINE', 'OFFLINE'],
        description: 'Filter by session status',
      },
      subscription: {
        type: 'string',
        description: 'Filter by subscription plan',
      },
      module_type: {
        type: 'string',
        description: 'Filter by module type',
      },
      bundles: {
        type: 'string',
        description: 'Filter by bundles type',
      },
      search_type: {
        type: 'string',
        enum: ['and', 'or'],
        description:
          'Search condition type. Defaults to "and" for multiple specific fields, "or" for searchTerm',
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        description: 'Maximum number of SIMs to return (default: 10)',
      },
      last_evaluated_key: {
        type: 'string',
        description: 'Pagination key from previous response',
      },
    },
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const validatedArgs = SearchSimsArgsSchema.parse(args);
    const client = await this.getAuthenticatedClient(context);

    // Build search parameters intelligently
    const searchParams = this.buildSearchParams(validatedArgs);

    const sims = await client.query.searchSims(searchParams);

    return this.formatSuccess({
      data: sims,
      metadata: {
        totalCount: sims.length,
        hasMore: searchParams.limit ? sims.length === searchParams.limit : false,
        searchType: searchParams.search_type || 'and',
        searchParams: searchParams, // Debug: show what params were sent
      },
    });
  }

  private buildSearchParams(args: z.infer<typeof SearchSimsArgsSchema>) {
    const params: SearchSimsParams = {};

    // Handle searchTerm - special parameter that searches across multiple fields
    if (args.searchTerm && !this.hasSpecificSearchFields(args)) {
      // Search across multiple fields with OR logic
      params.name = args.searchTerm;
      params.group = args.searchTerm;
      params.imsi = args.searchTerm;
      params.msisdn = args.searchTerm;
      params.iccid = args.searchTerm;
      params.serial_number = args.searchTerm;
      params.sim_id = args.searchTerm;
      params.tag = args.searchTerm;
      params.search_type = 'or';
    } else {
      // Apply specific field values directly
      if (args.name) params.name = args.name;
      if (args.group) params.group = args.group;
      if (args.group_id) params.group_id = args.group_id;
      if (args.sim_id) params.sim_id = args.sim_id;
      if (args.imsi) params.imsi = args.imsi;
      if (args.msisdn) params.msisdn = args.msisdn;
      if (args.iccid) params.iccid = args.iccid;
      if (args.serial_number) params.serial_number = args.serial_number;
      if (args.tag) params.tag = args.tag;
      if (args.status) params.status = args.status;
      if (args.session_status) params.session_status = args.session_status;
      if (args.subscription) params.subscription = args.subscription;
      if (args.module_type) params.module_type = args.module_type;
      if (args.bundles) params.bundles = args.bundles;
    }

    // Apply search type with intelligent defaults
    if (args.search_type) {
      params.search_type = args.search_type;
    } else {
      // If multiple specific search fields are used, default to AND logic
      // searchTerm case already sets OR logic above
      const hasMultipleFields =
        this.hasSpecificSearchFields(args) && Object.keys(params).length > 1;
      if (hasMultipleFields && !params.search_type) {
        params.search_type = 'and';
      }
    }

    // Apply pagination parameters with default limit
    params.limit = args.limit !== undefined ? args.limit : 10;
    if (args.last_evaluated_key) {
      params.last_evaluated_key = args.last_evaluated_key;
    }

    return params;
  }

  private hasSpecificSearchFields(args: z.infer<typeof SearchSimsArgsSchema>): boolean {
    const searchFields = [
      'name',
      'group',
      'group_id',
      'sim_id',
      'imsi',
      'msisdn',
      'iccid',
      'serial_number',
      'tag',
      'status',
      'subscription',
      'module_type',
      'bundles',
      'session_status',
    ];

    return searchFields.some((field) => args[field as keyof typeof args]);
  }
}
