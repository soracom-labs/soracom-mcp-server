import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Env {
  SORACOM_AUTH_KEY_ID: string;
  SORACOM_AUTH_KEY: string;
  SORACOM_COVERAGE_TYPE: 'jp' | 'g';
  SORACOM_LOG_LEVEL: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}

interface SoracomProfile {
  authKeyId: string;
  authKey: string;
  coverageType?: 'jp' | 'g';
}

function loadProfile(profileName: string): SoracomProfile {
  try {
    const profilePath = join(homedir(), '.soracom', `${profileName}.json`);
    const profileContent = readFileSync(profilePath, 'utf8');
    const profile = JSON.parse(profileContent) as SoracomProfile;

    if (!profile.authKeyId || !profile.authKey) {
      throw new Error('Profile does not contain required authKeyId and authKey');
    }

    return profile;
  } catch (error) {
    throw new Error(
      `Failed to load profile ${profileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export function getEnv(): Env {
  const profile = process.env['SORACOM_PROFILE'];

  // プロファイルまたは環境変数から認証情報を取得
  const credentials = profile ? loadProfile(profile) : null;
  const authKeyId = credentials?.authKeyId || process.env['SORACOM_AUTH_KEY_ID'];
  const authKey = credentials?.authKey || process.env['SORACOM_AUTH_KEY'];

  if (!authKeyId || !authKey) {
    throw new Error(
      'Authentication required: Set SORACOM_AUTH_KEY_ID and SORACOM_AUTH_KEY environment variables, or use SORACOM_PROFILE environment variable to specify a SORACOM CLI profile',
    );
  }

  return {
    SORACOM_AUTH_KEY_ID: authKeyId,
    SORACOM_AUTH_KEY: authKey,
    SORACOM_COVERAGE_TYPE:
      (process.env['SORACOM_COVERAGE_TYPE'] as 'jp' | 'g') || credentials?.coverageType || 'jp',
    SORACOM_LOG_LEVEL:
      (process.env['SORACOM_LOG_LEVEL'] as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') || 'INFO',
  };
}
