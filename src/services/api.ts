/**
 * Legacy API helper kept for backwards compatibility.
 *
 * The app now calls TanStack server functions (see `src/lib/pid/api.functions.ts`)
 * directly through the per-domain service modules. `VITE_API_BASE_URL` is no
 * longer required.
 */

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

export const API_BASE_URL = "";
export const USE_MOCK = false;
