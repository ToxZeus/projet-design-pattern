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

/**
 * Small `fetch` wrapper. Every call returns a `Result` (Cours 6): a `Success`
 * with the parsed body, or a `Failure` with a typed `HttpError` — never throws.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl = "", timeoutMs = 8000) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
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
    // abort the request once the timeout fires
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? this.timeoutMs);

    try {
      const response = await fetch(this.baseUrl + path, {
        method,
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        return new Failure({ kind: "status", status: response.status, message: `HTTP ${response.status}` });
      }
      return new Success(await parseJson<T>(response));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return new Failure({ kind: "timeout", message: "La requête a expiré." });
      }
      return new Failure({ kind: "network", message: "Erreur réseau." });
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text.length === 0 ? undefined : JSON.parse(text)) as T;
}
