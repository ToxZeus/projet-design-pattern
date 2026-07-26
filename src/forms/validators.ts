/**
 * A validation rule (Strategy). Returns `null` when the value is valid,
 * otherwise the error message to display.
 */
export interface Validator {
  validate(value: string): string | null;
}

/** Fails when the value is empty (or only whitespace). */
export class Required implements Validator {
  private readonly message: string;

  constructor(message = "Ce champ est requis.") {
    this.message = message;
  }

  validate(value: string): string | null {
    return value.trim().length === 0 ? this.message : null;
  }
}

/** Fails when the value is shorter than `min` characters. */
export class MinLength implements Validator {
  private readonly min: number;
  private readonly message: string;

  constructor(min: number, message?: string) {
    this.min = min;
    this.message = message ?? `Minimum ${min} caractères.`;
  }

  validate(value: string): string | null {
    return value.length < this.min ? this.message : null;
  }
}

/** Fails when the value is not a plausible email address. */
export class Email implements Validator {
  private readonly message: string;

  constructor(message = "Adresse email invalide.") {
    this.message = message;
  }

  validate(value: string): string | null {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : this.message;
  }
}

/** Fails when the value does not match the given regular expression. */
export class Pattern implements Validator {
  private readonly regex: RegExp;
  private readonly message: string;

  constructor(regex: RegExp, message = "Format invalide.") {
    this.regex = regex;
    this.message = message;
  }

  validate(value: string): string | null {
    return this.regex.test(value) ? null : this.message;
  }
}
