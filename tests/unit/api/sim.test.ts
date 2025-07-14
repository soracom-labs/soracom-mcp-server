import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as simApi from '../../../src/api/sim.js';
import { mockSimListResponse } from '../../mocks/soracom-responses.js';

describe('SimApi', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('listSims', () => {
    it('should list all SIMs', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockSimListResponse,
      });

      const result = await simApi.listSims(mockAxiosInstance);

      expect(result).toEqual(mockSimListResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sims', {
        params: undefined,
      });
    });

    it('should handle list parameters', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockSimListResponse,
      });

      const params = { limit: 10, lastEvaluatedKey: 'sim-001' };
      await simApi.listSims(mockAxiosInstance, params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sims', {
        params,
      });
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [],
      });

      const result = await simApi.listSims(mockAxiosInstance);
      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          data: {
            message: 'API Error',
          },
        },
      });

      await expect(simApi.listSims(mockAxiosInstance)).rejects.toThrow();
    });
  });

  describe('getSim', () => {
    it('should get a single SIM by ID', async () => {
      const simId = 'sim-001';
      const mockSim = mockSimListResponse[0];
      mockAxiosInstance.get.mockResolvedValue({
        data: mockSim,
      });

      const result = await simApi.getSim(mockAxiosInstance, simId);

      expect(result).toEqual(mockSim);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/sims/${simId}`, { params: undefined });
    });

    it('should handle not found error', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            message: 'SIM not found',
          },
        },
      });

      await expect(simApi.getSim(mockAxiosInstance, 'invalid-sim')).rejects.toThrow();
    });
  });
});
