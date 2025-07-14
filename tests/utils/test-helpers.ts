import { vi } from 'vitest';
import { CommandContext } from '../../src/lib/types.js';
import { SoracomClient } from '../../src/lib/soracom-client.js';

export function createMockContext(overrides?: Partial<CommandContext['config']>): CommandContext {
  return {
    config: {
      authKeyId: 'test-key-id',
      authKeyToken: 'test-key-token',
      coverage: 'jp',
      ...overrides,
    },
  };
}

export function setupMockClient(mockClient: any) {
  // Mock the SoracomClient.getInstance method
  vi.spyOn(SoracomClient, 'getInstance').mockResolvedValue(mockClient);
  return mockClient;
}

/**
 * Complete test environment setup
 */
export function setupTestEnvironment(mockClient?: any) {
  // Clear all mocks
  vi.clearAllMocks();

  // Create or use provided mock client
  const client = mockClient || createMockClientWithDefaults();

  // Setup client
  setupMockClient(client);

  // Create context
  const context = createMockContext();

  return {
    client,
    context,
  };
}

export function createMockClientWithDefaults() {
  return {
    sim: {
      listSims: vi.fn().mockResolvedValue([]),
      getSim: vi.fn(),
      listSimSessionEvents: vi.fn().mockResolvedValue([]),
      listSimStatusHistory: vi.fn().mockResolvedValue([]),
    },
    stats: {
      getAirStatsOfSim: vi.fn().mockResolvedValue({}),
      getAirStatsOfOperator: vi.fn().mockResolvedValue({}),
      getAirStatsOfGroup: vi.fn().mockResolvedValue({}),
    },
    billing: {
      getLatestBilling: vi.fn().mockResolvedValue({}),
      getBillingHistory: vi.fn().mockResolvedValue([]),
      getBilling: vi.fn().mockResolvedValue({}),
      getBillingSummaryOfBillItems: vi.fn().mockResolvedValue([]),
      getBillingSummaryOfSims: vi.fn().mockResolvedValue([]),
    },
    query: {
      searchSims: vi.fn().mockResolvedValue([]),
    },
    group: {
      listGroups: vi.fn().mockResolvedValue([]),
      getGroup: vi.fn().mockResolvedValue({}),
    },
    logout: vi.fn().mockResolvedValue({}),
  };
}

/**
 * Simplified mock client setup for individual tests
 */
export function mockSoracomClient() {
  const mockClient = createMockClientWithDefaults();
  setupMockClient(mockClient);
  return mockClient;
}
