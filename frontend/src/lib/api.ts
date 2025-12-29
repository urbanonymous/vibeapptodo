import type { User } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown; user?: User | null } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (opts.user) {
    const token = await opts.user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });

  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new ApiError(`API request failed: ${res.status}`, res.status, body);
  }
  return (await parseJsonSafe(res)) as T;
}

