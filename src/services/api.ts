/**
 * Base API client for the future FastAPI backend.
 *
 * Behavior:
 * - If `VITE_API_BASE_URL` is set, requests are sent to that backend.
 * - If it's NOT set, services fall back to local mock data so the UI keeps
 *   working today. Each service is responsible for its own mock fallback via
 *   `fetchOrMock`.
 *
 * Add new endpoints in `src/services/<domain>.ts`. Do not call `fetch`
 * directly from components or hooks — go through a service.
 */

export const API_BASE_URL: string =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL ?? "").trim();

export const USE_MOCK: boolean = API_BASE_URL.length === 0;

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Query;
}

function buildUrl(path: string, query?: Query): string {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const url = new URL(path.replace(/^\//, ""), base);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (USE_MOCK) {
    throw new ApiError("VITE_API_BASE_URL is not configured", 0);
  }

  const { body, query, headers, ...rest } = opts;
  const init: RequestInit = {
    method: rest.method ?? "GET",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  };
  if (body !== undefined) (init as { body?: string }).body = JSON.stringify(body);

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), init);
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? `Network error: ${err.message}` : "Network error",
      0,
    );
  }

  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      try {
        errBody = await res.text();
      } catch {
        errBody = undefined;
      }
    }
    throw new ApiError(`Request failed (${res.status}) for ${path}`, res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Try the real API when configured, otherwise return the mock value.
 * Real-API errors are NOT swallowed — they propagate so hooks can expose
 * proper error states.
 */
export async function fetchOrMock<T>(
  path: string,
  mock: () => T | Promise<T>,
  opts?: RequestOptions,
): Promise<T> {
  if (USE_MOCK) return await mock();
  return apiRequest<T>(path, opts);
}
