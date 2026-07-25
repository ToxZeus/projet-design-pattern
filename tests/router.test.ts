import { beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "../src/router/index.ts";

const routes = ["/", "/tasks", "/tasks/:id", "/users/:userId/posts/:postId"];

beforeEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("Router", () => {
  it("matches the initial location", () => {
    const router = new Router(routes);
    expect(router.getMatch().pattern).toBe("/");
    router.destroy();
  });

  it("navigate updates the match and extracts the param", () => {
    const router = new Router(routes);
    router.navigate("/tasks/12");

    expect(router.getMatch().pattern).toBe("/tasks/:id");
    expect(router.getMatch().params).toEqual({ id: "12" });
    expect(window.location.pathname).toBe("/tasks/12");
    router.destroy();
  });

  it("extracts several params", () => {
    const router = new Router(routes);
    router.navigate("/users/7/posts/42");
    expect(router.getMatch().params).toEqual({ userId: "7", postId: "42" });
    router.destroy();
  });

  it("returns an empty pattern when nothing matches", () => {
    const router = new Router(routes);
    router.navigate("/nope/here");
    expect(router.getMatch().pattern).toBe("");
    router.destroy();
  });

  it("notifies subscribers on navigation, then stops after unsubscribe", () => {
    const router = new Router(routes);
    const listener = vi.fn();
    const unsubscribe = router.subscribe(listener);

    router.navigate("/tasks");
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ pattern: "/tasks", path: "/tasks" }),
    );

    unsubscribe();
    router.navigate("/tasks/1");
    expect(listener).toHaveBeenCalledTimes(2);
    router.destroy();
  });

  it("reacts to back/forward through popstate", () => {
    const router = new Router(routes);
    router.navigate("/tasks/5");

    window.history.pushState({}, "", "/tasks/9");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(router.getMatch().params).toEqual({ id: "9" });
    router.destroy();
  });
});
