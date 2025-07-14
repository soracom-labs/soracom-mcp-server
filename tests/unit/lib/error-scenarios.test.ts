import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoracomClient } from '../../../src/lib/soracom-client.js';
import { authManager } from '../../../src/lib/auth-manager.js';
import axios from 'axios';

// Mock the env module to avoid requiring environment variables
vi.mock('../../../src/lib/env.js', () => ({
  getEnv: () => ({
    SORACOM_AUTH_KEY_ID: 'test-auth-key-id',
    SORACOM_AUTH_KEY: 'test-auth-key-token',
    SORACOM_COVERAGE_TYPE: 'jp',
    SORACOM_LOG_LEVEL: 'INFO',
  }),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

describe('Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authManager.clearAll();
  });

  it('should handle connection timeout', async () => {
    const mockAxiosInstance = {
      post: vi.fn().mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      }),
      defaults: { headers: {} },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

    await expect(
      SoracomClient.getInstance({
        authKeyId: 'test-key',
        authKeyToken: 'test-token',
        coverage: 'jp',
      }),
    ).rejects.toThrow();
  });

  it('should handle invalid credentials', async () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Invalid authentication credentials' },
      },
      isAxiosError: true,
    };

    const mockAxiosInstance = {
      post: vi.fn().mockRejectedValue(error),
      defaults: { headers: {} },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(
      SoracomClient.getInstance({
        authKeyId: 'invalid-key',
        authKeyToken: 'invalid-token',
        coverage: 'jp',
      }),
    ).rejects.toThrow('Authentication failed');
  });

  it('should handle 500 Internal Server Error', async () => {
    const error = {
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
      isAxiosError: true,
    };

    const mockAxiosInstance = {
      post: vi.fn().mockRejectedValue(error),
      defaults: { headers: {} },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(
      SoracomClient.getInstance({
        authKeyId: 'test-key',
        authKeyToken: 'test-token',
        coverage: 'jp',
      }),
    ).rejects.toThrow('Authentication failed');
  });

  it('should handle auth cache expiry', () => {
    const cacheKey = 'test-key';

    authManager.set(cacheKey, {
      apiKey: 'test-api-key',
      token: 'test-token',
      operatorId: 'OP123',
      expiresAt: Date.now() - 1000, // Already expired
    });

    const result = authManager.get(cacheKey);
    expect(result).toBeNull();
  });
});
