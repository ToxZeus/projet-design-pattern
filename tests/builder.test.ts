import { describe, expect, it, vi } from "vitest";
import { TagBuilder } from "../src/core/builder.ts";

describe("TagBuilder", () => {
  it("builds an element with the requested tag name", () => {
    const element = new TagBuilder("div").build();
    expect(element.tagName).toBe("DIV");
  });

  it("sets text content via withText", () => {
    const element = new TagBuilder("p").withText("hello").build();
    expect(element.textContent).toBe("hello");
  });

  it("adds classes via withClass", () => {
    const element = new TagBuilder("div").withClass("card").withClass("active").build();
    expect(element.classList.contains("card")).toBe(true);
    expect(element.classList.contains("active")).toBe(true);
  });

  it("removes a class via withoutClass", () => {
    const element = new TagBuilder("div").withClass("card").withoutClass("card").build();
    expect(element.classList.contains("card")).toBe(false);
  });

  it("applies inline styles via withStyle", () => {
    const element = new TagBuilder("div").withStyle("color", "red").build();
    expect(element.style.color).toBe("red");
  });

  it("registers an event listener via withEvent", () => {
    const handler = vi.fn();
    const element = new TagBuilder("button").withEvent("click", handler).build();

    element.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not call a handler removed via withoutEvent", () => {
    const handler = vi.fn();
    const element = new TagBuilder("button")
      .withEvent("click", handler)
      .withoutEvent("click")
      .build();

    element.dispatchEvent(new Event("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("appends children via withChild in insertion order", () => {
    const child1 = document.createElement("span");
    const child2 = document.createElement("span");
    const element = new TagBuilder("div").withChild(child1).withChild(child2).build();

    expect(Array.from(element.children)).toEqual([child1, child2]);
  });

  it("returns this from every with*/without* method to allow chaining", () => {
    const builder = new TagBuilder("div");
    expect(builder.withText("t")).toBe(builder);
    expect(builder.withClass("c")).toBe(builder);
    expect(builder.withStyle("color", "red")).toBe(builder);
    expect(builder.withEvent("click", () => {})).toBe(builder);
    expect(builder.withChild(document.createElement("span"))).toBe(builder);
    expect(builder.withoutClass("c")).toBe(builder);
    expect(builder.withoutEvent("click")).toBe(builder);
  });
});
