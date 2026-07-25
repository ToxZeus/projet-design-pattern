import { describe, expect, it, vi } from "vitest";
import { Store, type Reducer } from "../src/store/index.ts";

interface CounterState {
  count: number;
  label: string;
}

type CounterAction = { type: "increment" } | { type: "setLabel"; label: string };

const reducer: Reducer<CounterState, CounterAction> = (state, action) => {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };
    case "setLabel":
      return { ...state, label: action.label };
    default:
      return state;
  }
};

function createStore(): Store<CounterState, CounterAction> {
  return new Store(reducer, { count: 0, label: "start" });
}

describe("Store", () => {
  it("exposes the initial state", () => {
    expect(createStore().getState()).toEqual({ count: 0, label: "start" });
  });

  it("updates the state through dispatch/reducer", () => {
    const store = createStore();
    store.dispatch({ type: "increment" });
    store.dispatch({ type: "increment" });
    expect(store.getState().count).toBe(2);
  });

  it("keeps the previous state untouched (no mutation)", () => {
    const store = createStore();
    const before = store.getState();
    store.dispatch({ type: "increment" });
    expect(before.count).toBe(0);
    expect(store.getState()).not.toBe(before);
  });

  it("notifies subscribers immediately and on every change", () => {
    const store = createStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: "increment" });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({ count: 1, label: "start" });
  });

  it("stops notifying after unsubscribe", () => {
    const store = createStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch({ type: "increment" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("select fires only when the chosen field changes", () => {
    const store = createStore();
    const onCount = vi.fn();
    store.select("count", onCount);

    store.dispatch({ type: "setLabel", label: "hello" });
    expect(onCount).toHaveBeenCalledTimes(1);

    store.dispatch({ type: "increment" });
    expect(onCount).toHaveBeenCalledTimes(2);
    expect(onCount).toHaveBeenLastCalledWith(1);
  });
});
