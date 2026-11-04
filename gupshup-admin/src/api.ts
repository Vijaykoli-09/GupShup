// true  = use fake data from mock.ts (no backend needed)
// false = call the real Spring Boot backend
export const USE_MOCK = false;

const BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'gupshup_admin_token';

// sessionStorage clears when the tab closes. Fine for development.
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => sessionStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (USE_MOCK) {
    const { mockApi } = await import('./mock');
    return (await mockApi(path, options)) as T;
  }

  const token = getToken();
  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired or invalid admin session: go back to login.
    if (res.status === 401 && token) {
      clearToken();
      window.location.href = '/login';
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const post = <T,>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const del = <T,>(path: string) => api<T>(path, { method: 'DELETE' });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });