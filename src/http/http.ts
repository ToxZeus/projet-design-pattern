import { Failure, Success, type Result } from "../core/result.ts";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/** Why an HTTP call failed. */
export interface HttpError {
  kind: "network" | "timeout" | "status";
  /** Present only when `kind` is "status". */
  status?: number;
  message: string;
}

/** Per-request options. */
export interface HttpOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/** The method, path and headers of a request, as seen by interceptors. */
export interface HttpRequestContext {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
}

/**
 * A pluggable step in the request/response pipeline (Strategy): several
 * interceptors can be combined and swapped independently of the `HttpClient`
 * itself (auth headers, logging, retries...).
 */
export interface HttpInterceptor {
  /** Runs before the request is sent; returns the (possibly modified) context. */
  onRequest?(context: HttpRequestContext): HttpRequestContext | Promise<HttpRequestContext>;
  /** Runs after a `Result` is produced, before it reaches the caller. */
  onResponse?<T>(
    result: Result<T, HttpError>,
    context: HttpRequestContext,
  ): Result<T, HttpError> | Promise<Result<T, HttpError>>;
}

/**
 * Small `fetch` wrapper. Every call returns a `Result` (Cours 6): a `Success`
 * with the parsed body, or a `Failure` with a typed `HttpError` — never throws.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly interceptors: HttpInterceptor[];

  constructor(baseUrl = "", timeoutMs = 8000, interceptors: HttpInterceptor[] = []) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.interceptors = [...interceptors];
  }

  /** Registers an extra interceptor, run after the ones already in place. */
  use(interceptor: HttpInterceptor): void {
    this.interceptors.push(interceptor);
  }

  get<T>(path: string, options?: HttpOptions): Promise<Result<T, HttpError>> {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body: unknown, options?: HttpOptions): Promise<Result<T, HttpError>> {
    return this.request<T>("POST", path, body, options);
  }

  put<T>(path: string, body: unknown, options?: HttpOptions): Promise<Result<T, HttpError>> {
    return this.request<T>("PUT", path, body, options);
  }

  delete<T>(path: string, options?: HttpOptions): Promise<Result<T, HttpError>> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body: unknown,
    options?: HttpOptions,
  ): Promise<Result<T, HttpError>> {
    let context: HttpRequestContext = {
      method,
      path,
      headers: { "Content-Type": "application/json", ...options?.headers },
    };
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        context = await interceptor.onRequest(context);
      }
    }

    // abort the request once the timeout fires
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? this.timeoutMs);

    let result: Result<T, HttpError>;
    try {
      const response = await fetch(this.baseUrl + context.path, {
        method: context.method,
        headers: context.headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      result = !response.ok
        ? new Failure({ kind: "status", status: response.status, message: `HTTP ${response.status}` })
        : new Success(await parseJson<T>(response));
    } catch (error) {
      result =
        error instanceof DOMException && error.name === "AbortError"
          ? new Failure({ kind: "timeout", message: "La requête a expiré." })
          : new Failure({ kind: "network", message: "Erreur réseau." });
    } finally {
      clearTimeout(timeout);
    }

    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        result = await interceptor.onResponse(result, context);
      }
    }
    return result;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text.length === 0 ? undefined : JSON.parse(text)) as T;
}
