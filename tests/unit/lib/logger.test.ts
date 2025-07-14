import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../../src/lib/logger.js';

describe('Logger', () => {
  let originalEnv: string | undefined;
  let stderrWriteSpy: any;

  beforeEach(() => {
    // Save original env
    originalEnv = process.env['SORACOM_LOG_LEVEL'];

    // Clear environment variable to start fresh
    delete process.env['SORACOM_LOG_LEVEL'];

    // Mock process.stderr.write
    stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    // Clear all calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore env
    if (originalEnv !== undefined) {
      process.env['SORACOM_LOG_LEVEL'] = originalEnv;
    } else {
      delete process.env['SORACOM_LOG_LEVEL'];
    }

    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should write debug logs to stderr when debug level is set', () => {
    process.env['SORACOM_LOG_LEVEL'] = 'DEBUG';

    logger.debug('Debug message', { foo: 'bar' });

    expect(stderrWriteSpy).toHaveBeenCalled();
    const output = stderrWriteSpy.mock.calls[0][0];
    expect(output).toContain('[DEBUG] Debug message');
    expect(output).toContain('"foo": "bar"');
  });

  it('should write info logs to stderr', () => {
    process.env['SORACOM_LOG_LEVEL'] = 'INFO';

    logger.info('Info message', { test: 123 });

    expect(stderrWriteSpy).toHaveBeenCalled();
    const output = stderrWriteSpy.mock.calls[0][0];
    expect(output).toContain('[INFO] Info message');
    expect(output).toContain('"test": 123');
  });

  it('should write warn logs to stderr', () => {
    process.env['SORACOM_LOG_LEVEL'] = 'INFO';

    logger.warn('Warning message');

    expect(stderrWriteSpy).toHaveBeenCalled();
    const output = stderrWriteSpy.mock.calls[0][0];
    expect(output).toContain('[WARN] Warning message');
  });

  it('should write error logs to stderr', () => {
    process.env['SORACOM_LOG_LEVEL'] = 'INFO';

    logger.error('Error message', { error: 'details' });

    expect(stderrWriteSpy).toHaveBeenCalled();
    const output = stderrWriteSpy.mock.calls[0][0];
    expect(output).toContain('[ERROR] Error message');
    expect(output).toContain('"error": "details"');
  });

  it('should respect log level settings', () => {
    process.env['SORACOM_LOG_LEVEL'] = 'WARN';

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    // Should only log WARN and ERROR messages (2 calls to stderr.write)
    expect(stderrWriteSpy).toHaveBeenCalledTimes(2);

    const outputs = stderrWriteSpy.mock.calls.map((call) => call[0]);
    expect(outputs[0]).toContain('[WARN] Warn message');
    expect(outputs[1]).toContain('[ERROR] Error message');
  });

  it('should handle logs without data', () => {
    process.env['SORACOM_LOG_LEVEL'] = 'INFO';

    logger.info('Simple message');

    expect(stderrWriteSpy).toHaveBeenCalled();
    const output = stderrWriteSpy.mock.calls[0][0];
    expect(output).toContain('[INFO] Simple message');
    expect(output).not.toContain('{');
  });

  it('should default to INFO level when SORACOM_LOG_LEVEL is not set', () => {
    delete process.env['SORACOM_LOG_LEVEL'];

    logger.debug('Debug message');
    logger.info('Info message');

    // Should only log INFO message (1 call to stderr.write)
    expect(stderrWriteSpy).toHaveBeenCalledTimes(1);
    const output = stderrWriteSpy.mock.calls[0][0];
    expect(output).toContain('[INFO] Info message');
  });
});
