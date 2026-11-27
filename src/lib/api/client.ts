import type { ApiErrorPayload, ApiResponse, RequestConfig } from '@/types/api';

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiClientError';
    this.status = payload.status;
    this.errors = payload.errors;
  }
}

function buildUrl(path: string, params?: RequestConfig['params']): string {
  const normalizedBase = DEFAULT_API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Lightweight fetch wrapper designed for Laravel REST API (JSON + Sanctum/Bearer auth).
 */
export async function apiRequest<T>(
  path: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { params, token, headers, ...init } = config;
  const targetUrl = buildUrl(path, params);

  const response = await fetch(targetUrl, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let errorBody: Partial<ApiErrorPayload> = {};
    try {
      errorBody = (await response.json()) as Partial<ApiErrorPayload>;
    } catch {
      // Ignore non-JSON error responses
    }
    throw new ApiClientError({
      message: errorBody.message ?? `Request failed with status ${response.status}`,
      status: response.status,
      errors: errorBody.errors,
    });
  }

  return (await response.json()) as ApiResponse<T>;
}

export const apiClient = {
  get: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(path, {
      ...config,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, config?: RequestConfig) =>
    apiRequest<T>(path, { ...config, method: 'DELETE' }),
};
