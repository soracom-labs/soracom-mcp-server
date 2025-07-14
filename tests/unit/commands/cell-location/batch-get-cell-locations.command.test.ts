import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BatchGetCellLocationsCommand } from '../../../../src/commands/cell-location/batch-get-cell-locations.command.js';
import { SoracomClient } from '../../../../src/lib/soracom-client.js';
import { CommandContext } from '../../../../src/lib/types.js';
import { CellLocation } from '../../../../src/api/types/cell-location.js';

vi.mock('../../../../src/lib/soracom-client.js');

describe('BatchGetCellLocationsCommand', () => {
  const mockClient = {
    cellLocation: {
      batchGetCellLocations: vi.fn(),
    },
  };

  const context: CommandContext = {
    config: {
      authKeyId: 'test-key-id',
      authKeyToken: 'test-key-token',
      coverage: 'jp',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SoracomClient.getInstance).mockResolvedValue(mockClient as any);
  });

  describe('execute', () => {
    it('should get cell locations successfully for 3G', async () => {
      const mockLocations: CellLocation[] = [
        {
          lat: 35.6814383,
          lon: 139.7665133,
          range: 500,
          samples: 10,
          avg_strength: -85,
          exact: 0,
          identifier: 'test001',
          created: '2022-01-01T00:00:00.000Z',
          updated: '2022-01-01T00:00:00.000Z',
        },
      ];
      mockClient.cellLocation.batchGetCellLocations.mockResolvedValue(mockLocations);

      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              mcc: '440',
              mnc: '10',
              lac: '195',
              cid: '68485165',
              identifier: 'test001',
            },
          ],
        },
        context,
      );

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.any(String),
          },
        ],
      });

      expect(mockClient.cellLocation.batchGetCellLocations).toHaveBeenCalledWith([
        {
          mcc: '440',
          mnc: '10',
          lac: '195',
          cid: '68485165',
          identifier: 'test001',
        },
      ]);

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(1);
      expect(parsed.data.metadata.totalCount).toBe(1);
      expect(parsed.data.metadata.requestCount).toBe(1);
    });

    it('should get cell locations successfully for 4G', async () => {
      const mockLocations: CellLocation[] = [
        {
          lat: 35.7119449,
          lon: 139.813642,
          range: 476,
          samples: 7,
          avg_strength: -75,
          exact: 0,
          identifier: 'test002',
          created: '2022-01-01T00:00:00.000Z',
          updated: '2022-01-01T00:00:00.000Z',
        },
      ];
      mockClient.cellLocation.batchGetCellLocations.mockResolvedValue(mockLocations);

      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              mcc: '440',
              mnc: '10',
              tac: '5840',
              ecid: '44668480',
              identifier: 'test002',
            },
          ],
        },
        context,
      );

      expect(mockClient.cellLocation.batchGetCellLocations).toHaveBeenCalledWith([
        {
          mcc: '440',
          mnc: '10',
          tac: '5840',
          ecid: '44668480',
          identifier: 'test002',
        },
      ]);

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(1);
    });

    it('should handle multiple cell identifiers', async () => {
      const mockLocations: CellLocation[] = [
        {
          lat: 35.6814383,
          lon: 139.7665133,
          identifier: 'test001',
        },
        {
          lat: 35.7119449,
          lon: 139.813642,
          identifier: 'test002',
        },
      ];
      mockClient.cellLocation.batchGetCellLocations.mockResolvedValue(mockLocations);

      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              mcc: '440',
              mnc: '10',
              lac: '195',
              cid: '68485165',
              identifier: 'test001',
            },
            {
              mcc: '440',
              mnc: '10',
              tac: '5840',
              ecid: '44668480',
              identifier: 'test002',
            },
          ],
        },
        context,
      );

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(2);
      expect(parsed.data.metadata.totalCount).toBe(2);
      expect(parsed.data.metadata.requestCount).toBe(2);
    });

    it('should handle empty results', async () => {
      mockClient.cellLocation.batchGetCellLocations.mockResolvedValue([]);

      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              mcc: '440',
              mnc: '10',
              lac: '195',
              cid: '99999999',
            },
          ],
        },
        context,
      );

      // @ts-expect-error - accessing text property for test
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.data).toHaveLength(0);
      expect(parsed.data.metadata.totalCount).toBe(0);
      expect(parsed.data.metadata.requestCount).toBe(1);
    });

    it('should validate required parameters', async () => {
      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              // Missing mcc and mnc
              lac: '195',
              cid: '68485165',
            },
          ],
        },
        context,
      );

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error'),
          },
        ],
        isError: true,
      });
      expect(mockClient.cellLocation.batchGetCellLocations).not.toHaveBeenCalled();
    });

    it('should validate non-empty cell identifiers array', async () => {
      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [],
        },
        context,
      );

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('At least one cell identifier is required'),
          },
        ],
        isError: true,
      });
      expect(mockClient.cellLocation.batchGetCellLocations).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const error = new Error('Cell location lookup failed');
      mockClient.cellLocation.batchGetCellLocations.mockRejectedValue(error);

      const command = new BatchGetCellLocationsCommand();
      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              mcc: '440',
              mnc: '10',
              lac: '195',
              cid: '68485165',
            },
          ],
        },
        context,
      );

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error: Cell location lookup failed'),
          },
        ],
        isError: true,
      });
    });

    it('should handle missing credentials', async () => {
      const command = new BatchGetCellLocationsCommand();
      const invalidContext = {
        config: {
          authKeyId: '',
          authKeyToken: '',
          coverage: 'jp' as const,
        },
      };

      const result = await command.execute(
        {
          cellIdentifiers: [
            {
              mcc: '440',
              mnc: '10',
              lac: '195',
              cid: '68485165',
            },
          ],
        },
        invalidContext,
      );

      expect(result).toMatchObject({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('SORACOM credentials not configured'),
          },
        ],
        isError: true,
      });
    });
  });
});
