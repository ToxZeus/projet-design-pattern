import { describe, expect, it, vi } from "vitest";
import { Observable } from "../src/core/observer.ts";
import { Component } from "../src/components/index.ts";

describe("Component", () => {
  class TestComponent extends Component<{ value: string }> {
    readonly lifecycle: string[] = [];

    render(): HTMLElement {
      const element = document.createElement("div");
      element.textContent = this.props.value;
      return element;
    }

    protected override onMount(): void {
      this.lifecycle.push("mount");
    }

    protected override onUpdate(): void {
      this.lifecycle.push("update");
    }

    protected override onDestroy(): void {
      this.lifecycle.push("destroy");
    }

    watch(observable: Observable<string>, update: (value: string) => void): void {
      this.bind(observable, update);
    }
  }

  it("runs lifecycle hooks while mounting, updating and destroying", () => {
    const root = document.createElement("main");
    const component = new TestComponent({ value: "one" });

    component.mount(root);
    component.update({ value: "two" });
    component.destroy();

    expect(root.textContent).toBe("");
    expect(component.lifecycle).toEqual(["mount", "update", "destroy"]);
  });

  it("removes tracked observable subscriptions on destroy", () => {
    const root = document.createElement("main");
    const observable = new Observable("initial");
    const component = new TestComponent({ value: "component" });
    const update = vi.fn();

    component.mount(root);
    component.watch(observable, update);
    observable.next("before-destroy");
    component.destroy();
    observable.next("after-destroy");

    expect(update).toHaveBeenCalledTimes(2);
  });
});
