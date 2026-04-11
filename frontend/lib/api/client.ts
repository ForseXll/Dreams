import { ApiError, normalizeApiError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type QueryValue = string | number | boolean | null | undefined;

interface ApiRequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';
  query?: Record<string, QueryValue>;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(path, API_BASE_URL);

  if (query && typeof query === 'object') {
    Object.keys(query).forEach((key) => {
      const value = query[key];

      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function getBody(method: ApiRequestOptions['method'], data: unknown) {
  if (data === undefined || data === null) {
    return undefined;
  }

  if (method === 'GET' || method === 'HEAD') {
    return undefined;
  }

  return JSON.stringify(data);
}

async function parseResponseBody<TResponse>(response: Response): Promise<TResponse | null> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json() as Promise<TResponse>;
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TResponse | null> {
  const method = options.method || 'GET';
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (method !== 'GET' && method !== 'HEAD' && options.body !== undefined && options.body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers,
      body: getBody(method, options.body),
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the API at ${url}. Check that the backend is running and that NEXT_PUBLIC_API_URL is correct.`,
      {
        details: error,
        url,
      }
    );
  }

  const payload = await parseResponseBody<TResponse & { code?: string; details?: unknown; error?: string; message?: string }>(response);

  if (!response.ok) {
    const normalized = normalizeApiError(payload, `Request failed with status ${response.status}`);
    throw new ApiError(normalized.message, {
      status: response.status,
      code: normalized.code,
      details: normalized.details,
      url,
    });
  }

  return payload;
}

export const apiClient = {
  delete<TResponse>(path: string, options: Omit<ApiRequestOptions, 'method'> = {}) {
    return apiRequest<TResponse>(path, { ...options, method: 'DELETE' });
  },
  get<TResponse>(path: string, options: Omit<ApiRequestOptions, 'body' | 'method'> = {}) {
    return apiRequest<TResponse>(path, { ...options, method: 'GET' });
  },
  patch<TResponse>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'body' | 'method'> = {}) {
    return apiRequest<TResponse>(path, { ...options, method: 'PATCH', body });
  },
  post<TResponse>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'body' | 'method'> = {}) {
    return apiRequest<TResponse>(path, { ...options, method: 'POST', body });
  },
  put<TResponse>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'body' | 'method'> = {}) {
    return apiRequest<TResponse>(path, { ...options, method: 'PUT', body });
  },
};
