import { describe, expect, it, vi } from "vitest";
import {
  ButtonTag,
  HeadingTag,
  HorizontalRuleTag,
  ImageTag,
  TagFactory,
} from "../src/core/factory.ts";

describe("Concrete Tag classes", () => {
  it("ButtonTag renders a <button> with text and a click handler", () => {
    const handler = vi.fn();
    const element = new ButtonTag({ text: "Acheter", events: { click: handler } }).toHtml();

    expect(element.tagName).toBe("BUTTON");
    expect(element.textContent).toBe("Acheter");

    element.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("ImageTag renders an <img> with the given src", () => {
    const element = new ImageTag({ src: "/photo.png" }).toHtml();
    expect(element.tagName).toBe("IMG");
    expect(element.getAttribute("src")).toBe("/photo.png");
  });

  it("HorizontalRuleTag renders an <hr>", () => {
    expect(new HorizontalRuleTag().toHtml().tagName).toBe("HR");
  });

  it("HeadingTag renders the tag matching the requested level", () => {
    expect(new HeadingTag({ level: 3, text: "Titre" }).toHtml().tagName).toBe("H3");
  });

  it("HeadingTag defaults to level 1", () => {
    expect(new HeadingTag().toHtml().tagName).toBe("H1");
  });

  it("applies id, classNames and arbitrary attributes", () => {
    const element = new ButtonTag({
      id: "submit-btn",
      classNames: ["btn", "btn-primary"],
      attributes: { type: "submit" },
    }).toHtml();

    expect(element.id).toBe("submit-btn");
    expect(element.classList.contains("btn-primary")).toBe(true);
    expect(element.getAttribute("type")).toBe("submit");
  });
});

describe("TagFactory", () => {
  it("creates the tag matching the requested type", () => {
    expect(TagFactory.create("button").toHtml().tagName).toBe("BUTTON");
    expect(TagFactory.create("div").toHtml().tagName).toBe("DIV");
    expect(TagFactory.create("span").toHtml().tagName).toBe("SPAN");
    expect(TagFactory.create("paragraph").toHtml().tagName).toBe("P");
    expect(TagFactory.create("input").toHtml().tagName).toBe("INPUT");
    expect(TagFactory.create("hr").toHtml().tagName).toBe("HR");
    expect(TagFactory.create("image", { src: "/a.png" }).toHtml().tagName).toBe("IMG");
    expect(TagFactory.create("heading", { level: 2 }).toHtml().tagName).toBe("H2");
  });

  it("forwards the configuration to the created tag", () => {
    const element = TagFactory.create("paragraph", { text: "Description du produit" }).toHtml();
    expect(element.textContent).toBe("Description du produit");
  });
});
