import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Mock environment variables for tests
vi.mock('../src/lib/env', () => ({
  getEnv: () => ({
    SORACOM_AUTH_KEY_ID: 'test-auth-key-id',
    SORACOM_AUTH_KEY: 'test-auth-key-token',
    SORACOM_COVERAGE_TYPE: 'jp',
    SORACOM_LOG_LEVEL: 'INFO',
  }),
}));

export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
