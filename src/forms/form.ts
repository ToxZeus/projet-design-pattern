import { Observable, type Unsubscribe } from "../core/observer.ts";
import type { Validator } from "./validators.ts";

/**
 * A single form field: its value and current error live in observables, so the
 * DOM can react to both. Validators run in order and the first failure wins.
 */
export class Field {
  readonly value: Observable<string>;
  readonly error: Observable<string | null>;
  private readonly validators: Validator[];

  constructor(initial = "", validators: Validator[] = []) {
    this.validators = validators;
    this.value = new Observable(initial);
    this.error = new Observable<string | null>(null);
  }

  /** Updates the value and refreshes the error. */
  setValue(next: string): void {
    this.value.next(next);
    this.error.next(this.firstError(next));
  }

  /** Re-checks the current value; returns `true` when valid. */
  validate(): boolean {
    const error = this.firstError(this.value.getValue());
    this.error.next(error);
    return error === null;
  }

  private firstError(value: string): string | null {
    for (const validator of this.validators) {
      const message = validator.validate(value);
      if (message !== null) {
        return message;
      }
    }
    return null;
  }
}

/** Two-way binding between a field and an `<input>` (state ↔ input). */
export function bindInput(field: Field, input: HTMLInputElement): Unsubscribe {
  const unsubscribe = field.value.subscribe((value) => {
    if (input.value !== value) {
      input.value = value;
    }
  });
  const onInput = () => field.setValue(input.value);
  input.addEventListener("input", onInput);

  return () => {
    unsubscribe();
    input.removeEventListener("input", onInput);
  };
}

/** Shows the field error message inside `target` (empty when valid). */
export function bindError(field: Field, target: HTMLElement): Unsubscribe {
  return field.error.subscribe((message) => {
    target.textContent = message ?? "";
  });
}

/** Groups named fields, validates them together and collects their values. */
export class Form<Keys extends string> {
  private readonly fields: Record<Keys, Field>;

  constructor(fields: Record<Keys, Field>) {
    this.fields = fields;
  }

  /** Access one field by name. */
  field(name: Keys): Field {
    return this.fields[name];
  }

  /** Validates every field; returns `true` when all are valid. */
  validate(): boolean {
    let valid = true;
    for (const name of this.names()) {
      if (!this.fields[name].validate()) {
        valid = false;
      }
    }
    return valid;
  }

  /** Current values keyed by field name. */
  values(): Record<Keys, string> {
    const result = {} as Record<Keys, string>;
    for (const name of this.names()) {
      result[name] = this.fields[name].value.getValue();
    }
    return result;
  }

  /** Validates, then returns the values if valid, otherwise `null`. */
  submit(): Record<Keys, string> | null {
    return this.validate() ? this.values() : null;
  }

  private names(): Keys[] {
    return Object.keys(this.fields) as Keys[];
  }
}
