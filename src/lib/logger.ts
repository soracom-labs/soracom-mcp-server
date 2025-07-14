const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 } as const;

function log(level: keyof typeof LOG_LEVELS, message: string, data?: unknown) {
  const envLogLevel = process.env['SORACOM_LOG_LEVEL']?.toUpperCase() as keyof typeof LOG_LEVELS;
  const currentLogLevel = LOG_LEVELS[envLogLevel] ?? LOG_LEVELS.INFO;

  if (LOG_LEVELS[level] >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    const fullMessage = data ? `${logMessage} ${JSON.stringify(data, null, 2)}` : logMessage;

    // For MCP servers, we must not write to stdout as it's used for JSON-RPC communication
    // All logs go to stderr to avoid interfering with the protocol
    process.stderr.write(fullMessage + '\n');
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log('DEBUG', message, data),
  info: (message: string, data?: unknown) => log('INFO', message, data),
  warn: (message: string, data?: unknown) => log('WARN', message, data),
  error: (message: string, data?: unknown) => log('ERROR', message, data),
};
