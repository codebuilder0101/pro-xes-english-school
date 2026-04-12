import { getAccessToken } from "./session";

const base = import.meta.env.VITE_API_URL ?? "";

export type ApiError = Error & { code?: string; status?: number };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, { ...init, headers });
  const json = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };

  if (!res.ok) {
    const err = new Error(json?.error?.message || res.statusText) as ApiError;
    err.code = json?.error?.code;
    err.status = res.status;
    throw err;
  }

  return json as T;
}
