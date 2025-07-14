import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoracomClient } from '../../../src/lib/soracom-client.js';
import { mockAuthResponse } from '../../mocks/soracom-responses.js';

// Mock the env module to avoid requiring environment variables
vi.mock('../../../src/lib/env.js', () => ({
  getEnv: () => ({
    SORACOM_AUTH_KEY_ID: 'test-auth-key-id',
    SORACOM_AUTH_KEY: 'test-auth-key-token',
    SORACOM_COVERAGE_TYPE: 'jp',
    SORACOM_LOG_LEVEL: 'INFO',
  }),
}));

const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  defaults: { headers: {} },
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn((error) => error.isAxiosError),
  },
}));

describe('SoracomClient', () => {
  let client: SoracomClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear client cache before each test
    (SoracomClient as any).clientCache = new Map();
    // Setup default mock response for authentication
    mockAxiosInstance.post.mockResolvedValue({
      data: mockAuthResponse,
    });
  });

  describe('getInstance', () => {
    it('should initialize with API modules', async () => {
      client = await SoracomClient.getInstance({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
        coverage: 'jp',
      });
      expect(client).toBeDefined();
      expect(client.sim).toBeDefined();
      expect(client.stats).toBeDefined();
      expect(client.billing).toBeDefined();
    });
  });

  describe('authenticate', () => {
    beforeEach(async () => {
      client = await SoracomClient.getInstance({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
        coverage: 'jp',
      });
    });

    it('should be authenticated after getInstance', async () => {
      expect(client.isAuthenticated()).toBe(true);
      expect(client.getOperatorId()).toBe(mockAuthResponse.operatorId);
    });

    it('should set auth headers after authentication', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      await client.authenticate({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
      });

      expect(mockInstance.defaults.headers['X-Soracom-API-Key']).toBe(mockAuthResponse.apiKey);
      expect(mockInstance.defaults.headers['X-Soracom-Token']).toBe(mockAuthResponse.token);
    });

    it('should handle authentication errors', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockRejectedValue({
        isAxiosError: true,
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      await expect(
        client.authenticate({
          authKeyId: 'invalid-key',
          authKeyToken: 'invalid-token',
        }),
      ).rejects.toThrow('Authentication failed: Invalid credentials');
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(async () => {
      client = await SoracomClient.getInstance({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
        coverage: 'jp',
      });
    });

    it('should return true after successful authentication', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      await client.authenticate({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
      });

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('getOperatorId', () => {
    beforeEach(async () => {
      client = await SoracomClient.getInstance({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
        coverage: 'jp',
      });
    });

    it('should return operator ID after authentication', async () => {
      const mockInstance = (client as any).axiosInstance;
      mockInstance.post.mockResolvedValue({
        data: mockAuthResponse,
      });

      await client.authenticate({
        authKeyId: 'test-key-id',
        authKeyToken: 'test-key-token',
      });

      expect(client.getOperatorId()).toBe(mockAuthResponse.operatorId);
    });
  });
});
