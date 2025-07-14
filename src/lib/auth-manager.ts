import { logger } from './logger.js';
import { TIME_CONSTANTS } from './constants.js';

export interface CachedAuth {
  apiKey: string;
  token: string;
  operatorId: string;
  expiresAt: number;
}

/**
 * Manages authentication caching
 * This is a module-level singleton, no need for getInstance pattern
 */
class AuthManager {
  private cache: Map<string, CachedAuth> = new Map();

  /**
   * Get cached authentication if valid
   */
  get(cacheKey: string): CachedAuth | null {
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      logger.debug('No cached auth found', { cacheKey });
      return null;
    }

    // Check if token is expired (with buffer)
    const now = Date.now();

    if (now >= cached.expiresAt - TIME_CONSTANTS.AUTH_TOKEN_EXPIRY_BUFFER_MS) {
      logger.info('Cached auth token expired or expiring soon', {
        cacheKey,
        expiresAt: new Date(cached.expiresAt).toISOString(),
      });
      this.cache.delete(cacheKey);
      return null;
    }

    logger.debug('Using cached auth token', {
      cacheKey,
      expiresAt: new Date(cached.expiresAt).toISOString(),
    });

    return cached;
  }

  /**
   * Store authentication in cache
   */
  set(cacheKey: string, auth: CachedAuth): void {
    this.cache.set(cacheKey, auth);
    logger.info('Auth token cached', {
      cacheKey,
      expiresAt: new Date(auth.expiresAt).toISOString(),
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(cacheKey?: string): void {
    if (cacheKey) {
      this.cache.delete(cacheKey);
      logger.debug('Cache cleared', { cacheKey });
    } else {
      // If no key provided, clear all
      this.clearAll();
    }
  }

  /**
   * Clear all cached entries
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('All auth cache cleared', { entriesCleared: size });
  }

  /**
   * Generate cache key from credentials
   */
  static generateCacheKey(authKeyId: string): string {
    // Use only the key ID for caching (not the secret)
    return `auth:${authKeyId}`;
  }
}

// Export as a singleton instance
export const authManager = new AuthManager();

// Also export the generateCacheKey as a standalone function for convenience
export const generateAuthCacheKey = AuthManager.generateCacheKey;
