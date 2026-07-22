import { describe, expect, it } from "vitest";
import { AppConfig, AppStore } from "../src/core/singleton.ts";
import { VolatileStorage } from "../src/core/strategy.ts";

describe("AppConfig", () => {
  it("always returns the same instance", () => {
    expect(AppConfig.getInstance()).toBe(AppConfig.getInstance());
  });

  it("stores and retrieves values", () => {
    AppConfig.getInstance().set("apiUrl", "/api");
    expect(AppConfig.getInstance().get("apiUrl")).toBe("/api");
  });

  it("returns undefined for an unknown key", () => {
    expect(AppConfig.getInstance().get("does-not-exist")).toBeUndefined();
  });
});

describe("AppStore", () => {
  it("always returns the same instance", () => {
    expect(AppStore.getInstance()).toBe(AppStore.getInstance());
  });

  it("stores and retrieves typed state in memory", () => {
    const store = AppStore.getInstance();
    store.setState("theme", "dark");
    expect(store.getState<string>("theme")).toBe("dark");
  });

  it("delegates persistence to the current storage strategy", async () => {
    const strategy = new VolatileStorage();
    const store = AppStore.getInstance();
    store.setStrategy(strategy);

    await store.setState("persisted-key", { count: 1 });

    await expect(strategy.get("persisted-key")).resolves.toEqual({ count: 1 });
  });

  it("hydrates in-memory state from the storage strategy", async () => {
    const strategy = new VolatileStorage();
    await strategy.set("hydrated-key", "value-from-storage");

    const store = AppStore.getInstance();
    store.setStrategy(strategy);
    await store.hydrate("hydrated-key");

    expect(store.getState<string>("hydrated-key")).toBe("value-from-storage");
  });
});
