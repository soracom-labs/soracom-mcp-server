import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedVersion: string | null = null;

/**
 * Get the version from package.json
 * Caches the result to avoid repeated file reads
 */
export function getVersion(): string {
  if (cachedVersion === null) {
    try {
      const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
      cachedVersion = packageJson.version || '1.0.0';
    } catch {
      // Fallback version if package.json can't be read
      cachedVersion = '1.0.0';
    }
  }
  return cachedVersion!; // cachedVersion is guaranteed to be non-null here
}
