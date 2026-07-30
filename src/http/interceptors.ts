import type { Result } from "../core/result.ts";
import type { HttpError, HttpInterceptor, HttpRequestContext } from "./http.ts";

/**
 * Attaches a bearer token to every request, when the token provider returns
 * one (e.g. reading from {@link AppConfig}). Leaves the request untouched
 * otherwise.
 */
export class AuthInterceptor implements HttpInterceptor {
  private readonly getToken: () => string | undefined;

  constructor(getToken: () => string | undefined) {
    this.getToken = getToken;
  }

  onRequest(context: HttpRequestContext): HttpRequestContext {
    const token = this.getToken();
    if (!token) {
      return context;
    }
    return { ...context, headers: { ...context.headers, Authorization: `Bearer ${token}` } };
  }
}

/** Logs every request and its outcome to the console — useful during development. */
export class LoggingInterceptor implements HttpInterceptor {
  onRequest(context: HttpRequestContext): HttpRequestContext {
    console.info(`[http] → ${context.method} ${context.path}`);
    return context;
  }

  onResponse<T>(result: Result<T, HttpError>, context: HttpRequestContext): Result<T, HttpError> {
    console.info(`[http] ← ${context.method} ${context.path}`, result);
    return result;
  }
}
