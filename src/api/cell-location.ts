import { AxiosInstance } from 'axios';
import { post } from './api-utils.js';
import { BatchGetCellLocationsParams, CellLocation } from './types/cell-location.js';

/**
 * Get location information for multiple cell towers in batch
 */
export async function batchGetCellLocations(
  client: AxiosInstance,
  cellIdentifiers: BatchGetCellLocationsParams,
): Promise<CellLocation[]> {
  return post<CellLocation[]>(client, '/cell_locations', cellIdentifiers);
}
