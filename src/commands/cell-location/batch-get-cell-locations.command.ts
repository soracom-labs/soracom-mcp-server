import { z } from 'zod';
import { BaseCommand } from '../base-command.js';
import { CommandContext } from '../../lib/types.js';
import { BatchGetCellLocationsParams } from '../../api/types/cell-location.js';

const CellIdentifierSchema = z.object({
  mcc: z.string().min(1, 'MCC is required'),
  mnc: z.string().min(1, 'MNC is required'),
  lac: z.string().optional(),
  cid: z.string().optional(),
  tac: z.string().optional(),
  ecid: z.string().optional(),
  eci: z.string().optional(),
  identifier: z.string().optional(),
});

const BatchGetCellLocationsArgsSchema = z.object({
  cellIdentifiers: z.array(CellIdentifierSchema).min(1, 'At least one cell identifier is required'),
});

export class BatchGetCellLocationsCommand extends BaseCommand {
  name = 'CellLocation_batchGetCellLocations';
  description =
    'Get location information for multiple cell towers in batch. For 3G networks, specify MCC, MNC, LAC, and CID. For 4G/LTE networks, specify MCC, MNC, TAC, and ECID. Uses OpenCelliD Project database.';

  inputSchema = {
    type: 'object',
    properties: {
      cellIdentifiers: {
        type: 'array',
        description: 'Array of cell identifiers to get location information for',
        items: {
          type: 'object',
          properties: {
            mcc: {
              type: 'string',
              description: 'Mobile Country Code (required)',
            },
            mnc: {
              type: 'string',
              description: 'Mobile Network Code (required)',
            },
            lac: {
              type: 'string',
              description: 'Location Area Code (for 3G networks)',
            },
            cid: {
              type: 'string',
              description: 'Cell ID (for 3G networks)',
            },
            tac: {
              type: 'string',
              description: 'Tracking Area Code (for 4G/LTE networks)',
            },
            ecid: {
              type: 'string',
              description: 'Enhanced Cell ID (for 4G/LTE networks)',
            },
            eci: {
              type: 'string',
              description: 'Enhanced Cell ID alternative (same as ecid)',
            },
            identifier: {
              type: 'string',
              description: 'Optional identifier to link request to response',
            },
          },
          required: ['mcc', 'mnc'],
        },
        minItems: 1,
      },
    },
    required: ['cellIdentifiers'],
  };

  protected async executeCommand(args: unknown, context?: CommandContext) {
    const validatedArgs = BatchGetCellLocationsArgsSchema.parse(args);
    const client = await this.getAuthenticatedClient(context);

    const cellIdentifiers: BatchGetCellLocationsParams = validatedArgs.cellIdentifiers.map(
      (identifier) => {
        const result: any = {
          mcc: identifier.mcc,
          mnc: identifier.mnc,
        };
        if (identifier.lac !== undefined) result.lac = identifier.lac;
        if (identifier.cid !== undefined) result.cid = identifier.cid;
        if (identifier.tac !== undefined) result.tac = identifier.tac;
        if (identifier.ecid !== undefined) result.ecid = identifier.ecid;
        if (identifier.eci !== undefined) result.eci = identifier.eci;
        if (identifier.identifier !== undefined) result.identifier = identifier.identifier;
        return result;
      },
    );

    const locations = await client.cellLocation.batchGetCellLocations(cellIdentifiers);

    return this.formatSuccess({
      data: locations,
      metadata: {
        totalCount: locations.length,
        requestCount: cellIdentifiers.length,
      },
    });
  }
}
