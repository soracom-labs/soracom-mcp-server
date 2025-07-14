export interface PaginationParams {
  limit?: number;
  last_evaluated_key?: string;
}

export interface SoracomApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  headers?: Record<string, string>;
}
