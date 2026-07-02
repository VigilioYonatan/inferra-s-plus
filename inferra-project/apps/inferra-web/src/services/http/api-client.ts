export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as {
        title?: string;
        message?: string;
      };
      message = body.title || body.message || message;
    } catch {}
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  return requestJson<T>(path, { method: "GET", signal });
}

export async function postJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  return requestJson<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    signal,
  });
}

export async function putJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  return requestJson<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    signal,
  });
}

export async function deleteJson<T>(path: string): Promise<T> {
  return requestJson<T>(path, { method: "DELETE" });
}
