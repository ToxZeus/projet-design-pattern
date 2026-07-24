import type { Observable, Unsubscribe } from "../core/observer.ts";

/** Binds an observable to one DOM target and returns its cleanup function. */
export function bindObservable<T>(
  observable: Observable<T>,
  target: HTMLElement,
  update: (target: HTMLElement, value: T) => void,
): Unsubscribe {
  return observable.subscribe((value) => update(target, value));
}

/** Convenience binding for text content without creating a virtual DOM tree. */
export function bindText<T>(
  observable: Observable<T>,
  target: HTMLElement,
  format: (value: T) => string = String,
): Unsubscribe {
  return bindObservable(observable, target, (element, value) => {
    element.textContent = format(value);
  });
}
