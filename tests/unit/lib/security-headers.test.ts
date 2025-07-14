import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios, { AxiosInstance } from 'axios';
import { SecurityHeaders } from '../../../src/lib/security-headers.js';

const MOCK_VERSION = '1.2.3';

// Mock the version utility
vi.mock('../../../src/lib/version.js', () => ({
  getVersion: () => MOCK_VERSION,
}));

describe('SecurityHeaders', () => {
  let axiosInstance: AxiosInstance;

  beforeEach(() => {
    // Create a fresh axios instance
    axiosInstance = axios.create();
  });

  describe('configureAxios', () => {
    it('should add User-Agent and Accept headers to requests', async () => {
      // Apply security headers configuration
      SecurityHeaders.configureAxios(axiosInstance);

      // Mock adapter to capture the final config
      let capturedConfig: any;
      axiosInstance.defaults.adapter = async (config) => {
        capturedConfig = config;
        throw new Error('Test intercept'); // Prevent actual request
      };

      try {
        await axiosInstance.get('/test');
      } catch {
        // Expected to throw
      }

      expect(capturedConfig.headers['User-Agent']).toBe(`soracom-mcp-server/${MOCK_VERSION}`);
      expect(capturedConfig.headers['Accept']).toBe('application/json');
    });

    it('should handle request interceptor errors', async () => {
      SecurityHeaders.configureAxios(axiosInstance);

      // Add another interceptor that rejects
      axiosInstance.interceptors.request.use(() => Promise.reject(new Error('Request error')));

      await expect(axiosInstance.get('/test')).rejects.toThrow('Request error');
    });
  });
});
