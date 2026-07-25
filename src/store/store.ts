import { Observable, type Unsubscribe } from "../core/observer.ts";

/** An action is a plain object tagged by `type`, plus any payload fields. */
export interface Action {
  type: string;
}

/** Pure function that returns the next state for a given action. */
export type Reducer<State, A extends Action> = (state: State, action: A) => State;

/**
 * Reactive store: one source of truth built on `Observable`.
 * State only changes through `dispatch`, which keeps updates predictable.
 * Create it once and share that single instance across the app.
 */
export class Store<State, A extends Action = Action> {
  private readonly state: Observable<State>;
  private readonly reducer: Reducer<State, A>;

  constructor(reducer: Reducer<State, A>, initialState: State) {
    this.reducer = reducer;
    this.state = new Observable(initialState);
  }

  /** Current state, read once. */
  getState(): State {
    return this.state.getValue();
  }

  /** Runs the action through the reducer, then notifies subscribers. */
  dispatch(action: A): void {
    this.state.next(this.reducer(this.getState(), action));
  }

  /** Watches the whole state; fires once now, then on every change. */
  subscribe(listener: (state: State) => void): Unsubscribe {
    return this.state.subscribe(listener);
  }

  /** Watches a single field; fires once now, then only when that field changes. */
  select<Key extends keyof State>(
    key: Key,
    listener: (value: State[Key]) => void,
  ): Unsubscribe {
    let previous = this.getState()[key];
    listener(previous);
    return this.state.subscribe((state) => {
      const next = state[key];
      if (next === previous) return;
      previous = next;
      listener(next);
    });
  }
}
