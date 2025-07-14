import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getVersion } from './version.js';

const SERVER_NAME = 'soracom-mcp-server';
const ACCEPT_TYPE = 'application/json';

export class SecurityHeaders {
  /**
   * Add basic headers to axios instance
   */
  static configureAxios(axiosInstance: AxiosInstance): void {
    // Add request interceptor for basic headers
    axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // User agent
      config.headers['User-Agent'] = `${SERVER_NAME}/${getVersion()}`;

      // Accept headers
      config.headers['Accept'] = ACCEPT_TYPE;

      return config;
    });
  }
}
