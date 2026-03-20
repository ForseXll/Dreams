export interface ApiErrorDetails {
  code?: string;
  details?: unknown;
  status?: number;
  url?: string;
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;
  url?: string;

  constructor(message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status;
    this.code = details.code;
    this.details = details.details;
    this.url = details.url;
  }
}

interface ApiErrorPayload {
  code?: string;
  details?: unknown;
  error?: string;
  message?: string;
}

export function normalizeApiError(
  payload: ApiErrorPayload | null,
  fallbackMessage = 'Request failed'
) {
  if (!payload || typeof payload !== 'object') {
    return {
      message: fallbackMessage,
    };
  }

  const message = payload.message || payload.error || fallbackMessage;

  return {
    message,
    code: payload.code,
    details: payload.details,
  };
}
