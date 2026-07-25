/**
 * Functional data structures from the course (Cours 6): typed alternatives to
 * `null`/`undefined` and to exceptions.
 *
 * - `Option<T>` models a value that may be absent (`Some` or `None`).
 * - `Result<V, E>` models an operation that succeeds (`Success`) or fails
 *   (`Failure`) with a typed reason.
 *
 * Both force the caller to handle every case through `map` / `next` /
 * `withDefault`, instead of scattered null-checks or `try`/`catch`.
 */

/** A value that is either present (`Some`) or absent (`None`). */
export interface Option<Value> {
  /** Transforms the value when present; leaves `None` untouched. */
  map<NewValue>(update: (value: Value) => NewValue): Option<NewValue>;
  /** Returns the contained value, or `fallback` when absent. */
  withDefault(fallback: Value): Value;
}

/** An `Option` that holds a value. */
export class Some<Value> implements Option<Value> {
  private readonly value: Value;

  constructor(value: Value) {
    this.value = value;
  }

  map<NewValue>(update: (value: Value) => NewValue): Option<NewValue> {
    return new Some(update(this.value));
  }

  withDefault(_fallback: Value): Value {
    return this.value;
  }
}

/** An `Option` that holds nothing. */
export class None implements Option<never> {
  map<NewValue>(): Option<NewValue> {
    return this;
  }

  withDefault(fallback: never): never {
    return fallback;
  }
}

/** The outcome of an operation: a value (`Success`) or a reason (`Failure`). */
export interface Result<Value, Reason> {
  /** Transforms the value on success; propagates the failure unchanged. */
  map<NewValue>(update: (value: Value) => NewValue): Result<NewValue, Reason>;
  /**
   * Chains another operation that can itself fail (like `flatMap`); the chained
   * function only runs on success, otherwise the failure is propagated.
   */
  next<NewValue, NewReason>(
    update: (value: Value) => Result<NewValue, NewReason>,
  ): Result<NewValue, NewReason>;
  /** Returns the value on success, or `fallback` on failure. */
  withDefault(fallback: Value): Value;
}

/** A `Result` that holds a success value. */
export class Success<Value> implements Result<Value, never> {
  private readonly value: Value;

  constructor(value: Value) {
    this.value = value;
  }

  map<NewValue>(update: (value: Value) => NewValue): Result<NewValue, never> {
    return new Success(update(this.value));
  }

  next<NewValue, NewReason>(
    update: (value: Value) => Result<NewValue, NewReason>,
  ): Result<NewValue, NewReason> {
    return update(this.value);
  }

  withDefault(_fallback: Value): Value {
    return this.value;
  }
}

/** A `Result` that holds a failure reason (exposed via {@link Failure.reason}). */
export class Failure<Reason> implements Result<never, Reason> {
  readonly reason: Reason;

  constructor(reason: Reason) {
    this.reason = reason;
  }

  map<NewValue>(): Result<NewValue, Reason> {
    return this;
  }

  next<NewValue, NewReason>(): Result<NewValue, NewReason> {
    return this;
  }

  withDefault(fallback: never): never {
    return fallback;
  }
}
