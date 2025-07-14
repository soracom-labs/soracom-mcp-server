import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SoracomClient } from '../../src/lib/soracom-client.js';
import * as envModule from '../../src/lib/env.js';
import { authManager } from '../../src/lib/auth-manager.js';

// Mock the env module
vi.mock('../../src/lib/env.js');

const MOCK_VERSION = '1.2.3';

// Mock the version utility
vi.mock('../../src/lib/version.js', () => ({
  getVersion: () => MOCK_VERSION,
}));

const server = setupServer();

describe('Security Headers Integration', () => {
  let client: SoracomClient;
  let mockEnv: any;
  let capturedRequest: any = null;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  beforeEach(() => {
    capturedRequest = null;
    // Remove all handlers before adding new ones
    server.resetHandlers();

    // Clear auth cache to ensure no test interference
    authManager.clearAll();

    // Default mock env
    mockEnv = {
      SORACOM_AUTH_KEY_ID: 'keyId-test',
      SORACOM_AUTH_KEY: 'secret-test',
      SORACOM_LOG_LEVEL: 'ERROR',
      SORACOM_COVERAGE_TYPE: 'jp',
    };

    vi.mocked(envModule.getEnv).mockReturnValue(mockEnv as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    capturedRequest = null;
  });

  afterAll(() => {
    server.close();
  });

  it('should include security headers in requests', async () => {
    // Make sure env is set before creating client
    vi.mocked(envModule.getEnv).mockReturnValue(mockEnv as any);

    server.use(
      http.post('https://api.soracom.io/v1/auth', () => {
        return HttpResponse.json({
          apiKey: 'test-api-key',
          token: 'test-token',
          operatorId: 'OP123',
        });
      }),
      http.get('https://api.soracom.io/v1/sims', ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json([]);
      }),
    );

    client = await SoracomClient.getInstance({
      authKeyId: mockEnv.SORACOM_AUTH_KEY_ID,
      authKeyToken: mockEnv.SORACOM_AUTH_KEY,
      coverage: 'jp',
    });

    await client.sim.listSims();

    expect(capturedRequest).toBeTruthy();
    expect(capturedRequest.headers['user-agent']).toBe(`soracom-mcp-server/${MOCK_VERSION}`);
  });
});
