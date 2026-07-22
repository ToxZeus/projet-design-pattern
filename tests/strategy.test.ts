import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  IndexedDBStorage,
  LocalStorageAdapter,
  VolatileStorage,
  type StorageStrategy,
} from "../src/core/strategy.ts";

function sharedStorageStrategyContract(createStrategy: () => StorageStrategy) {
  it("returns undefined for a missing key", async () => {
    await expect(createStrategy().get("missing")).resolves.toBeUndefined();
  });

  it("stores and retrieves a value", async () => {
    const strategy = createStrategy();
    await strategy.set("key", { a: 1 });
    await expect(strategy.get("key")).resolves.toEqual({ a: 1 });
  });

  it("removes a value", async () => {
    const strategy = createStrategy();
    await strategy.set("key", "value");
    await strategy.remove("key");
    await expect(strategy.get("key")).resolves.toBeUndefined();
  });

  it("clears every value", async () => {
    const strategy = createStrategy();
    await strategy.set("key-a", "a");
    await strategy.set("key-b", "b");
    await strategy.clear();

    await expect(strategy.get("key-a")).resolves.toBeUndefined();
    await expect(strategy.get("key-b")).resolves.toBeUndefined();
  });
}

describe("VolatileStorage", () => {
  sharedStorageStrategyContract(() => new VolatileStorage());
});

describe("LocalStorageAdapter", () => {
  beforeEach(() => window.localStorage.clear());
  sharedStorageStrategyContract(() => new LocalStorageAdapter());

  it("namespaces keys so clear() does not affect unrelated localStorage entries", async () => {
    window.localStorage.setItem("unrelated", "keep-me");
    const strategy = new LocalStorageAdapter();
    await strategy.set("key", "value");
    await strategy.clear();

    expect(window.localStorage.getItem("unrelated")).toBe("keep-me");
  });
});

describe("IndexedDBStorage", () => {
  let dbCounter = 0;
  sharedStorageStrategyContract(() => new IndexedDBStorage(`test-db-${dbCounter++}`));
});
