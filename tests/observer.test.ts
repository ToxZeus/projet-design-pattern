import { describe, expect, it, vi } from "vitest";
import { Observable } from "../src/core/observer.ts";

describe("Observable", () => {
  it("exposes the initial value via getValue", () => {
    const observable = new Observable(42);
    expect(observable.getValue()).toBe(42);
  });

  it("calls a new subscriber immediately with the current value", () => {
    const observable = new Observable("light");
    const callback = vi.fn();

    observable.subscribe(callback);

    expect(callback).toHaveBeenCalledExactlyOnceWith("light");
  });

  it("notifies every subscriber when next is called", () => {
    const observable = new Observable(0);
    const first = vi.fn();
    const second = vi.fn();

    observable.subscribe(first);
    observable.subscribe(second);
    observable.next(1);

    expect(first).toHaveBeenLastCalledWith(1);
    expect(second).toHaveBeenLastCalledWith(1);
    expect(observable.getValue()).toBe(1);
  });

  it("stops notifying a subscriber once unsubscribed", () => {
    const observable = new Observable(0);
    const callback = vi.fn();
    const unsubscribe = observable.subscribe(callback);

    unsubscribe();
    observable.next(1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(1);
  });
});
