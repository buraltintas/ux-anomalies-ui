import "server-only";

function requireEnv(name: "BACKEND_API_BASE_URL" | "BFF_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export class BackendError extends Error {
  status: number;
  path: string;
  method: string;
  backendMessage?: string;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
  constructor(args: {
    message: string;
    status: number;
    path: string;
    method: string;
    backendMessage?: string;
    responseBody?: unknown;
    requestHeaders?: Record<string, string>;
  }) {
    super(args.message);
    this.name = "BackendError";
    this.status = args.status;
    this.path = args.path;
    this.method = args.method;
    this.backendMessage = args.backendMessage;
    this.responseBody = args.responseBody;
    this.requestHeaders = args.requestHeaders;
  }
}

type QueryValue = string | number | undefined | null;

interface RequestOptions extends RequestInit {
  query?: Record<string, QueryValue>;
}

function createBackendHeaders(customHeaders?: HeadersInit) {
  return {
    "Content-Type": "application/json",
    "X-BFF-Secret": requireEnv("BFF_SECRET"),
    ...(customHeaders ?? {}),
  };
}

function sanitizeHeadersForLog(headers: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  const redact = (key: string, value: string) => {
    const lower = key.toLowerCase();
    if (lower === "x-bff-secret" || lower === "authorization") {
      return "[REDACTED]";
    }
    return value;
  };

  if (!headers) {
    return out;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      out[key] = redact(key, value);
    });
    return out;
  }

  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      out[key] = redact(key, String(value));
    }
    return out;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value !== "undefined") {
      out[key] = redact(key, String(value));
    }
  }
  return out;
}

async function parseErrorBody(res: Response): Promise<{ parsed: unknown; backendMessage?: string }> {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await res.json()) as Record<string, unknown>;
      const messageFromBody =
        typeof body.message === "string"
          ? body.message
          : typeof body.error === "string"
            ? body.error
            : undefined;
      return { parsed: body, backendMessage: messageFromBody };
    } catch {
      return { parsed: { parseError: "Invalid JSON response body" } };
    }
  }

  try {
    const text = await res.text();
    return { parsed: text, backendMessage: text || undefined };
  } catch {
    return { parsed: { parseError: "Unable to read response body" } };
  }
}

export function isBackendError(error: unknown): error is BackendError {
  return error instanceof BackendError;
}

export function sanitizeBackendError(error: unknown) {
  if (!isBackendError(error)) {
    return { message: error instanceof Error ? error.message : "Unknown error type" };
  }
  return {
    message: error.message,
    status: error.status,
    path: error.path,
    method: error.method,
    backendMessage: error.backendMessage,
    responseBody: error.responseBody,
    requestHeaders: error.requestHeaders,
  };
}

export async function backendFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const url = new URL(path, requireEnv("BACKEND_API_BASE_URL"));

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const requestHeaders = createBackendHeaders(options.headers);

  const res = await fetch(url, {
    ...options,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!res.ok) {
    const { parsed, backendMessage } = await parseErrorBody(res);
    const error = new BackendError({
      message: "Backend request failed",
      status: res.status,
      path,
      method,
      backendMessage,
      responseBody: parsed,
      requestHeaders: sanitizeHeadersForLog(requestHeaders),
    });
    console.error("[BFF backend error]", sanitizeBackendError(error));
    throw error;
  }

  return (await res.json()) as T;
}

export async function backendFetchAsUser<T>(
  path: string,
  userHeaders: Record<string, string>,
  options: RequestOptions = {},
): Promise<T> {
  return backendFetch<T>(path, {
    ...options,
    headers: {
      ...userHeaders,
      ...(options.headers ?? {}),
    },
  });
}
