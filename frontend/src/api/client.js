import { clearSession, getToken } from '../auth/session';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function normalizeError(message) {
  if (!message) return 'Request failed. Please try again.';
  if (typeof message === 'string') return message;
  return 'Request failed. Please try again.';
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: hasBody && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (response.status === 401) {
    clearSession();
    throw new Error('Your session expired. Please sign in again.');
  }

  if (!response.ok) {
    const message = typeof payload === 'object' ? payload.message || payload.error : payload;
    throw new Error(normalizeError(message));
  }

  if (payload && typeof payload === 'object' && payload.success === false) {
    throw new Error(normalizeError(payload.message));
  }

  if (payload && typeof payload === 'object' && payload.success === true && 'data' in payload) {
    return payload.data;
  }

  return payload;
}
