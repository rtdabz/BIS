/**
 * Standard API contract types structured for future Laravel REST API integration.
 */

export interface LaravelMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: LaravelMeta;
}

export interface ApiErrorPayload {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
}
