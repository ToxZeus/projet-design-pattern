/**
 * Fluent builder for composing a DOM element (text, classes, inline styles,
 * event listeners and children) without overloaded constructors.
 */
export class TagBuilder {
  private text: string | undefined;
  private classes = new Set<string>();
  private styles = new Map<string, string>();
  private events = new Map<string, EventListener>();
  private children: HTMLElement[] = [];
  private tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  withText(text: string): this {
    this.text = text;
    return this;
  }

  withClass(className: string): this {
    this.classes.add(className);
    return this;
  }

  withStyle(property: string, value: string): this {
    this.styles.set(property, value);
    return this;
  }

  withEvent(event: string, handler: EventListener): this {
    this.events.set(event, handler);
    return this;
  }

  withChild(child: HTMLElement): this {
    this.children.push(child);
    return this;
  }

  withoutClass(className: string): this {
    this.classes.delete(className);
    return this;
  }

  withoutEvent(event: string): this {
    this.events.delete(event);
    return this;
  }

  /** Builds and returns the final `HTMLElement`. */
  build(): HTMLElement {
    const element = document.createElement(this.tag);

    if (this.text !== undefined) {
      element.textContent = this.text;
    }
    if (this.classes.size > 0) {
      element.classList.add(...this.classes);
    }
    for (const [property, value] of this.styles) {
      element.style.setProperty(property, value);
    }
    for (const [event, handler] of this.events) {
      element.addEventListener(event, handler);
    }
    for (const child of this.children) {
      element.appendChild(child);
    }

    return element;
  }
}
