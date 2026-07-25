import { Observable, type Unsubscribe } from "../core/observer.ts";

/** What the current URL resolved to. */
export interface RouteMatch {
  /** Pattern that matched, e.g. "/tasks/:id" (empty string when none does). */
  pattern: string;
  /** Actual path, e.g. "/tasks/12". */
  path: string;
  /** Params pulled from the path, e.g. `{ id: "12" }`. */
  params: Record<string, string>;
}

/**
 * Client-side router built on the History API. The active route is kept in an
 * `Observable`, so views just subscribe and re-render when it changes.
 */
export class Router {
  private readonly patterns: string[];
  private readonly match: Observable<RouteMatch>;
  private readonly onPopState: () => void;

  constructor(patterns: string[]) {
    this.patterns = patterns;
    this.match = new Observable(this.resolve(currentPath()));
    // back/forward buttons change the URL without a navigate() call
    this.onPopState = () => this.match.next(this.resolve(currentPath()));
    window.addEventListener("popstate", this.onPopState);
  }

  /** Current match, read once. */
  getMatch(): RouteMatch {
    return this.match.getValue();
  }

  /** Watch route changes; fires once now, then on every navigation. */
  subscribe(listener: (match: RouteMatch) => void): Unsubscribe {
    return this.match.subscribe(listener);
  }

  /** Go to `path` and add a history entry. */
  navigate(path: string): void {
    window.history.pushState({}, "", path);
    this.match.next(this.resolve(path));
  }

  /** Go to `path` but replace the current entry instead of adding one. */
  replace(path: string): void {
    window.history.replaceState({}, "", path);
    this.match.next(this.resolve(path));
  }

  /** Stop listening to the browser (call it when the router is thrown away). */
  destroy(): void {
    window.removeEventListener("popstate", this.onPopState);
  }

  private resolve(path: string): RouteMatch {
    for (const pattern of this.patterns) {
      const params = matchPattern(pattern, path);
      if (params) {
        return { pattern, path, params };
      }
    }
    return { pattern: "", path, params: {} };
  }
}

function currentPath(): string {
  return window.location.pathname;
}

/** Returns the extracted params if `pattern` matches `path`, else `null`. */
function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = segments(pattern);
  const pathParts = segments(path);
  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (const [index, patternPart] of patternParts.entries()) {
    const pathPart = pathParts[index];
    if (pathPart === undefined) {
      return null;
    }
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  return params;
}

function segments(path: string): string[] {
  return path.split("/").filter((part) => part.length > 0);
}
