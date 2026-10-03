import { handleMockApiRequest } from './mockService';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code = 'ERROR', status = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Ensures PLM_SESSION cookie is sent
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // If server responded with valid JSON and OK status
    if (response.ok && isJson) {
      const result = await response.json();
      if (result.success !== false) {
        return (result.data !== undefined ? result.data : result) as T;
      }
    }

    // If non-OK response or HTML returned (like Vercel routing /api to /index.html)
    // Seamlessly fall back to the Standalone Demo Mock Layer
    console.info(`[TadbeerGo] Endpoint '${endpoint}' not served by backend (status: ${response.status}). Using Smart Standalone Demo layer.`);
    return handleMockApiRequest(endpoint, options) as T;
  } catch (err: any) {
    // If backend server is unreachable (offline, CORS, or static Vercel host)
    console.info(`[TadbeerGo] Backend connection failed for '${endpoint}'. Using Smart Standalone Demo layer.`);
    return handleMockApiRequest(endpoint, options) as T;
  }
}

export const api = {
  get: <T = any>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, data?: any) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T = any>(url: string, data?: any) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};
