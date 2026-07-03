export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

/**
 * API Client for PlumbCore AI
 *
 * Placeholder for Supabase + TanStack Query integration.
 * Setup steps:
 *   1. npm install @supabase/supabase-js @tanstack/react-query
 *   2. Initialize Supabase client with env vars
 *   3. Create query hooks (useClients, useJobs, useInvoices, etc.)
 *   4. Set up React Query provider in the app root
 */
export function createClient(config: ApiClientConfig) {
  const { baseUrl } = config;

  async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  return {
    config,
    request,
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  };
}