import { AxiosInstance } from 'axios';

/**
 * Make a GET request
 */
export async function get<T>(client: AxiosInstance, url: string, params?: unknown): Promise<T> {
  const response = await client.get<T>(url, { params });
  return response.data;
}

/**
 * Make a POST request
 */
export async function post<T>(client: AxiosInstance, url: string, data?: unknown): Promise<T> {
  const response = await client.post<T>(url, data);
  return response.data;
}
