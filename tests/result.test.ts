import { describe, expect, it } from "vitest";
import {
  Failure,
  None,
  Some,
  Success,
  type Option,
  type Result,
} from "../src/core/result.ts";

describe("Option", () => {
  it("Some.map transforms the contained value", () => {
    const doubled = new Some(42).map((value) => value * 2);
    expect(doubled.withDefault(0)).toBe(84);
  });

  it("Some.withDefault returns the contained value", () => {
    expect(new Some("hello").withDefault("fallback")).toBe("hello");
  });

  it("None.map keeps the absence", () => {
    const nothing: Option<number> = new None();
    expect(nothing.map((value) => value * 2).withDefault(-1)).toBe(-1);
  });

  it("None.withDefault returns the fallback", () => {
    const nothing: Option<number> = new None();
    expect(nothing.withDefault(0)).toBe(0);
  });
});

describe("Result", () => {
  class DivisionByZeroError extends Error {
    override readonly name = "DivisionByZeroError";
  }

  function divide(
    numerator: number,
    denominator: number,
  ): Result<number, DivisionByZeroError> {
    if (denominator === 0) {
      return new Failure(new DivisionByZeroError());
    }
    return new Success(numerator / denominator);
  }

  it("Success.map transforms the value", () => {
    expect(new Success(5).map((value) => value * 3).withDefault(0)).toBe(15);
  });

  it("Success.next chains another operation that can fail", () => {
    const result = divide(15, 3).next((value) => divide(value, 2));
    expect(result.withDefault(0)).toBe(2.5);
  });

  it("Success.withDefault returns the value", () => {
    expect(new Success(7).withDefault(0)).toBe(7);
  });

  it("Failure.map propagates the failure", () => {
    const result = divide(15, 0).map((value) => value * 3);
    expect(result.withDefault(-1)).toBe(-1);
  });

  it("Failure.next propagates the failure without running the function", () => {
    let called = false;
    const result = divide(1, 0).next((value) => {
      called = true;
      return divide(value, 2);
    });

    expect(called).toBe(false);
    expect(result.withDefault(-1)).toBe(-1);
  });

  it("Failure.withDefault returns the fallback", () => {
    expect(divide(1, 0).withDefault(99)).toBe(99);
  });

  it("Failure exposes its typed reason", () => {
    const failure = new Failure(new DivisionByZeroError());
    expect(failure.reason.name).toBe("DivisionByZeroError");
  });
});
