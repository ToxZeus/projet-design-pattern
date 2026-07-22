/**
 * A callback notified with the latest value of an {@link Observable}.
 */
export type Subscriber<T> = (value: T) => void;

/**
 * A function that cancels a subscription created via {@link Observable.subscribe}.
 */
export type Unsubscribe = () => void;

/**
 * Minimal Observer-pattern primitive: holds a current value and notifies
 * subscribers whenever {@link Observable.next} is called.
 *
 * This is the reactivity backbone of the framework — the DOM-binding layer,
 * the store and the router are all built on top of `Observable`.
 */
export class Observable<T> {
  private subscribers: Set<Subscriber<T>> = new Set();
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Returns the current value without subscribing.
   */
  getValue(): T {
    return this.value;
  }

  /**
   * Registers a callback invoked on every future emission, and immediately
   * once with the current value.
   *
   * @returns a function that removes the subscription when called.
   */
  subscribe(callback: Subscriber<T>): Unsubscribe {
    this.subscribers.add(callback);
    callback(this.value);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Updates the current value and notifies every active subscriber.
   */
  next(value: T): void {
    this.value = value;
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }
}
