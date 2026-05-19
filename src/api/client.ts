import { platformEnv } from '../platform/env';

export type ApiError = {
  status: number;
  message: string;
};

/**
 * Placeholder HTTP client. Replace with fetch/axios when BE is available.
 */
export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${platformEnv.apiBaseUrl}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: `Request failed: ${response.status}`,
    };
    throw error;
  }

  return (await response.json()) as T;
}
