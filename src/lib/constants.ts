// Error messages
export const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'SORACOM credentials not configured',
  INVALID_PARAMETERS: 'Invalid parameters provided',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
} as const;

// Time-related constants in milliseconds
export const TIME_CONSTANTS = {
  // Auth
  AUTH_CACHE_DURATION_MS: 60 * 60 * 1000, // 1 hour
  AUTH_TOKEN_EXPIRY_BUFFER_MS: 5 * 60 * 1000, // 5 minutes buffer before expiry
} as const;

// Request configuration
export const REQUEST_CONFIG = {
  DEFAULT_TIMEOUT_MS: 10000, // 10 seconds
} as const;

// API limits
export const API_LIMITS = {
  MAX_SIM_ID_LENGTH: 100,
  MAX_GROUP_LIST_LIMIT: 100,
  MAX_SIM_SEARCH_LIMIT: 100,
} as const;
