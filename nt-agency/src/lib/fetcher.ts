// Client-side fetch helper: parses JSON and throws a FetchError carrying the server's message and field errors.
export class FetchError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new FetchError(0, "Network error. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Session expired while using the admin area: send the user back to login.
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    const details = data?.details;
    throw new FetchError(
      res.status,
      data?.error ?? `Request failed (${res.status})`,
      details && typeof details === "object" && !Array.isArray(details) ? details : undefined,
    );
  }
  return data as T;
}
