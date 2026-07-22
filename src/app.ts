import { AppConfig } from "./core/singleton.ts";
import { Observable } from "./core/observer.ts";
import { TagBuilder } from "./core/builder.ts";
import { TagFactory } from "./core/factory.ts";

/**
 * Small demo proving the core patterns work together end to end:
 * Singleton (config), Factory + Builder (DOM creation) and Observer
 * (reactive DOM update on user interaction).
 */
export function createApp(root: HTMLElement): void {
  AppConfig.getInstance().set("appName", "Mini-Framework Demo");

  const count = new Observable(0);

  const title = TagFactory.create("heading", {
    level: 1,
    text: AppConfig.getInstance().get("appName"),
  }).toHtml();

  const counterLabel = TagFactory.create("paragraph", { classNames: ["counter-value"] }).toHtml();

  const incrementButton = new TagBuilder("button")
    .withText("+1")
    .withClass("btn-primary")
    .withEvent("click", () => count.next(count.getValue() + 1))
    .build();

  count.subscribe((value) => {
    counterLabel.textContent = `Compteur : ${value}`;
    counterLabel.style.color = value % 2 === 0 ? "#2563eb" : "#dc2626";
  });

  const container = new TagBuilder("section")
    .withClass("demo")
    .withChild(title)
    .withChild(counterLabel)
    .withChild(incrementButton)
    .build();

  root.appendChild(container);
}
