import axios, { AxiosInstance } from 'axios';
import * as simApi from '../api/sim.js';
import * as billingApi from '../api/billing.js';
import * as statsApi from '../api/stats.js';
import * as groupApi from '../api/group.js';
import * as queryApi from '../api/query.js';
import * as cellLocationApi from '../api/cell-location.js';
import { SecurityHeaders } from './security-headers.js';
import { authManager, generateAuthCacheKey } from './auth-manager.js';
import { TIME_CONSTANTS } from './constants.js';
import { constants as httpConstants } from 'node:http2';
import { CoverageType } from './types.js';
import { logger } from './logger.js';

interface AuthCredentials {
  authKeyId: string;
  authKeyToken: string;
  coverage?: CoverageType;
}

interface AuthResponse {
  apiKey: string;
  token: string;
  operatorId: string;
}

// Client cache to reuse authenticated instances
const clientCache = new Map<string, SoracomClient>();

/**
 * SORACOM API client with authentication and caching support.
 *
 * Features:
 * - Automatic authentication token management
 * - Client instance reuse (per authKeyId and coverage)
 * - Automatic re-authentication on 401 errors
 *
 * @example
 * ```typescript
 * const client = await SoracomClient.getInstance({
 *   authKeyId: 'keyId_xxx',
 *   authKeyToken: 'keyToken_xxx',
 *   coverage: 'jp'
 * });
 *
 * const sim = await client.sim.getSim({ simId: '89811...' });
 * ```
 */
export class SoracomClient {
  // API functions
  readonly sim = {
    getSim: (simId: string) => simApi.getSim(this.axiosInstance, simId),
    listSims: (params?: Parameters<typeof simApi.listSims>[1]) =>
      simApi.listSims(this.axiosInstance, params),
    listSimSessionEvents: (
      simId: string,
      params?: Parameters<typeof simApi.listSimSessionEvents>[2],
    ) => simApi.listSimSessionEvents(this.axiosInstance, simId, params),
    listSimStatusHistory: (
      simId: string,
      params?: Parameters<typeof simApi.listSimStatusHistory>[2],
    ) => simApi.listSimStatusHistory(this.axiosInstance, simId, params),
  };

  readonly billing = {
    getBillingHistory: () => billingApi.getBillingHistory(this.axiosInstance),
    getBilling: (params: Parameters<typeof billingApi.getBilling>[1]) =>
      billingApi.getBilling(this.axiosInstance, params),
    getBillingSummaryOfBillItems: () => billingApi.getBillingSummaryOfBillItems(this.axiosInstance),
    getBillingSummaryOfSims: () => billingApi.getBillingSummaryOfSims(this.axiosInstance),
    getLatestBilling: () => billingApi.getLatestBilling(this.axiosInstance),
  };

  readonly group = {
    getGroup: (groupId: string) => groupApi.getGroup(this.axiosInstance, groupId),
    listGroups: (params?: Parameters<typeof groupApi.listGroups>[1]) =>
      groupApi.listGroups(this.axiosInstance, params),
  };

  readonly query = {
    searchSims: (params?: Parameters<typeof queryApi.searchSims>[1]) =>
      queryApi.searchSims(this.axiosInstance, params),
  };
  readonly cellLocation = {
    batchGetCellLocations: (params: Parameters<typeof cellLocationApi.batchGetCellLocations>[1]) =>
      cellLocationApi.batchGetCellLocations(this.axiosInstance, params),
  };

  readonly stats = {
    getAirStatsOfOperator: (params: Parameters<typeof statsApi.getAirStatsOfOperator>[2]) => {
      if (!this.operatorId) {
        throw new Error('Not authenticated. Operator ID is required.');
      }
      return statsApi.getAirStatsOfOperator(this.axiosInstance, this.operatorId, params);
    },
    getAirStatsOfSim: (params: Parameters<typeof statsApi.getAirStatsOfSim>[1]) =>
      statsApi.getAirStatsOfSim(this.axiosInstance, params),
    getAirStatsOfGroup: (params: Parameters<typeof statsApi.getAirStatsOfGroup>[1]) =>
      statsApi.getAirStatsOfGroup(this.axiosInstance, params),
  };
  private axiosInstance: AxiosInstance;
  private apiKey?: string;
  private apiToken?: string;
  private operatorId?: string;
  private credentials?: AuthCredentials;
  private coverage: CoverageType;

  /**
   * Get or create a SoracomClient instance.
   * Reuses existing authenticated clients based on authKeyId and coverage.
   *
   * @param credentials - SORACOM authentication credentials
   * @param credentials.authKeyId - SORACOM Auth Key ID
   * @param credentials.authKeyToken - SORACOM Auth Key Token
   * @param credentials.coverage - API coverage area ('jp' or 'g')
   * @returns Promise resolving to authenticated SoracomClient
   * @throws Error if authentication fails
   */
  static async getInstance(credentials: AuthCredentials): Promise<SoracomClient> {
    const coverage = credentials.coverage || 'jp';
    const clientKey = `${credentials.authKeyId}:${coverage}`;

    // Get or create client
    let client = clientCache.get(clientKey);
    if (!client) {
      logger.debug('Creating new SoracomClient instance', {
        authKeyId: credentials.authKeyId,
        coverage,
      });
      client = new SoracomClient(coverage);
      clientCache.set(clientKey, client);
    }

    try {
      // Authenticate (will use cached token if available)
      await client.authenticate(credentials);
      return client;
    } catch (error) {
      // Remove client from cache if authentication fails
      clientCache.delete(clientKey);
      throw error;
    }
  }

  private constructor(coverage: CoverageType = 'jp') {
    this.coverage = coverage;

    const baseURL = coverage === 'g' ? 'https://g.api.soracom.io/v1' : 'https://api.soracom.io/v1';

    const timeout = 10000; // 10 seconds fixed timeout

    logger.info('Creating SoracomClient', { coverage, baseURL, timeout });

    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure security headers
    SecurityHeaders.configureAxios(this.axiosInstance);

    // Set up response interceptor for automatic re-authentication
    this.setupAuthInterceptor();
  }

  async authenticate(credentials: AuthCredentials): Promise<void> {
    // Store credentials for re-authentication
    this.credentials = credentials;

    const cacheKey = generateAuthCacheKey(credentials.authKeyId);

    // Check if we have a valid cached token
    const cached = authManager.get(cacheKey);
    if (cached) {
      this.apiKey = cached.apiKey;
      this.apiToken = cached.token;
      this.operatorId = cached.operatorId;

      this.axiosInstance.defaults.headers['X-Soracom-API-Key'] = this.apiKey;
      this.axiosInstance.defaults.headers['X-Soracom-Token'] = this.apiToken;

      return;
    }

    // No valid cache, authenticate with API
    try {
      const response = await this.axiosInstance.post<AuthResponse>('/auth', {
        authKeyId: credentials.authKeyId,
        authKey: credentials.authKeyToken,
      });

      this.apiKey = response.data.apiKey;
      this.apiToken = response.data.token;
      this.operatorId = response.data.operatorId;

      this.axiosInstance.defaults.headers['X-Soracom-API-Key'] = this.apiKey;
      this.axiosInstance.defaults.headers['X-Soracom-Token'] = this.apiToken;

      // Cache the authentication
      // Token expires after 1 hour
      const expiresAt = Date.now() + TIME_CONSTANTS.AUTH_CACHE_DURATION_MS;

      authManager.set(cacheKey, {
        apiKey: this.apiKey,
        token: this.apiToken,
        operatorId: this.operatorId,
        expiresAt,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async logout(authKeyId?: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      // Call SORACOM logout API
      await this.axiosInstance.post('/auth/logout');

      // Clear local state
      delete this.apiKey;
      delete this.apiToken;
      delete this.operatorId;

      // Clear axios headers
      delete this.axiosInstance.defaults.headers['X-Soracom-API-Key'];
      delete this.axiosInstance.defaults.headers['X-Soracom-Token'];

      // Clear auth cache for the specific key if provided
      if (authKeyId) {
        const cacheKey = generateAuthCacheKey(authKeyId);
        authManager.clear(cacheKey);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Logout failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!(this.apiKey && this.apiToken);
  }

  getOperatorId(): string | undefined {
    return this.operatorId;
  }

  /**
   * Dispose of resources and cleanup
   */
  async dispose(): Promise<void> {
    if (this.isAuthenticated()) {
      try {
        await this.logout(this.credentials?.authKeyId);
      } catch (error) {
        logger.warn('Error during dispose', { error });
      }
    }

    // Remove from cache before clearing credentials
    if (this.credentials) {
      const clientKey = `${this.credentials.authKeyId}:${this.coverage}`;
      clientCache.delete(clientKey);
    }

    // Clear all resources
    delete this.apiKey;
    delete this.apiToken;
    delete this.operatorId;
    delete this.credentials;
    delete this.axiosInstance.defaults.headers.common['X-Soracom-API-Key'];
    delete this.axiosInstance.defaults.headers.common['X-Soracom-Token'];
  }

  /**
   * Clear all cached client instances and dispose of resources.
   * This includes logging out all authenticated sessions.
   *
   * @example
   * ```typescript
   * // Clean up all resources
   * await SoracomClient.clearAll();
   * ```
   */
  static async clearAll(): Promise<void> {
    const clients = Array.from(clientCache.values());
    const disposePromises = clients.map((client) => client.dispose());
    await Promise.allSettled(disposePromises);
    clientCache.clear();
    logger.info('All client instances cleared', { count: clients.length });
  }

  private setupAuthInterceptor(): void {
    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug('Making API request', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
        });
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for handling 401 errors and retries
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If we get a 401 and have credentials, try re-authenticating once
        if (
          error.response?.status === httpConstants.HTTP_STATUS_UNAUTHORIZED &&
          this.credentials &&
          !error.config._retry
        ) {
          error.config._retry = true;

          const cacheKey = generateAuthCacheKey(this.credentials.authKeyId);

          try {
            // Clear the cached token since it's invalid
            authManager.clear(cacheKey);

            // Clear current authentication state
            delete this.apiKey;
            delete this.apiToken;
            delete this.operatorId;
            delete this.axiosInstance.defaults.headers['X-Soracom-API-Key'];
            delete this.axiosInstance.defaults.headers['X-Soracom-Token'];

            // Re-authenticate
            if (!this.credentials) {
              throw new Error('No credentials available for re-authentication');
            }
            const response = await this.axiosInstance.post<AuthResponse>('/auth', {
              authKeyId: this.credentials.authKeyId,
              authKey: this.credentials.authKeyToken,
            });

            this.apiKey = response.data.apiKey;
            this.apiToken = response.data.token;
            this.operatorId = response.data.operatorId;

            this.axiosInstance.defaults.headers['X-Soracom-API-Key'] = this.apiKey;
            this.axiosInstance.defaults.headers['X-Soracom-Token'] = this.apiToken;

            // Cache the authentication
            const expiresAt = Date.now() + TIME_CONSTANTS.AUTH_CACHE_DURATION_MS;

            authManager.set(cacheKey, {
              apiKey: this.apiKey,
              token: this.apiToken,
              operatorId: this.operatorId,
              expiresAt,
            });

            // Retry the original request with new token
            error.config.headers['X-Soracom-API-Key'] = this.apiKey;
            error.config.headers['X-Soracom-Token'] = this.apiToken;

            return this.axiosInstance(error.config);
          } catch {
            // Re-authentication failed, return original error
            return Promise.reject(error);
          }
        }

        // Log timeout errors specifically
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          logger.error('Request timeout', {
            code: error.code,
            message: error.message,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            timeout: error.config?.timeout,
          });
        }

        return Promise.reject(error);
      },
    );
  }
}
