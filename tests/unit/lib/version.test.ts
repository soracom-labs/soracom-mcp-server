import { describe, it, expect } from 'vitest';
import { getVersion } from '../../../src/lib/version.js';

describe('Version Utility', () => {
  describe('getVersion', () => {
    it('should return a valid version string', () => {
      const version = getVersion();
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
      // Should match semantic versioning pattern
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should return the same version on multiple calls (caching)', () => {
      const version1 = getVersion();
      const version2 = getVersion();
      expect(version1).toBe(version2);
    });
  });
});
