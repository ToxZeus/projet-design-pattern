import { describe, expect, it } from "vitest";
import { Observable } from "../src/core/observer.ts";
import { bindObservable, bindText } from "../src/components/index.ts";

describe("Observable DOM binding", () => {
  it("updates only its target and can unsubscribe", () => {
    const observable = new Observable(1);
    const first = document.createElement("span");
    const second = document.createElement("span");

    const unsubscribe = bindText(observable, first, (value) => `Valeur ${value}`);
    bindObservable(observable, second, (target, value) => {
      target.setAttribute("data-value", String(value));
    });

    expect(first.textContent).toBe("Valeur 1");
    expect(second.getAttribute("data-value")).toBe("1");
    observable.next(2);
    expect(first.textContent).toBe("Valeur 2");
    expect(second.getAttribute("data-value")).toBe("2");

    unsubscribe();
    observable.next(3);
    expect(first.textContent).toBe("Valeur 2");
    expect(second.getAttribute("data-value")).toBe("3");
  });
});
