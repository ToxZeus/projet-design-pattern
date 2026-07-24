import { describe, expect, it, vi } from "vitest";
import { Card, List, Modal } from "../src/components/index.ts";

describe("Component composition", () => {
  it("renders Card children through its content slot", () => {
    const child = document.createElement("p");
    child.textContent = "Contenu";
    const card = new Card({ title: "Carte", children: [child] });
    const root = document.createElement("main");

    card.mount(root);

    expect(root.querySelector("h2")?.textContent).toBe("Carte");
    expect(root.querySelector(".component-card__content")?.textContent).toBe("Contenu");
  });

  it("sends selected list items to the parent callback", () => {
    const onSelect = vi.fn();
    const list = new List({
      items: ["A", "B"],
      renderItem: (item) => {
        const element = document.createElement("span");
        element.textContent = item;
        return element;
      },
      onSelect,
    });
    const root = document.createElement("main");
    list.mount(root);

    root.querySelectorAll("li")[1]?.dispatchEvent(new Event("click"));

    expect(onSelect).toHaveBeenCalledWith("B", 1);
  });

  it("supports a modal close event flowing to its parent", () => {
    const onClose = vi.fn();
    const modal = new Modal({ title: "Détails", open: true, onClose });
    const root = document.createElement("main");
    modal.mount(root);

    root.querySelector("button")?.click();

    expect((root.querySelector("dialog") as HTMLDialogElement).open).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
