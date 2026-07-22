import { TagBuilder } from "./builder.ts";

/**
 * Declarative configuration accepted by every {@link Tag}. Not every field
 * is meaningful for every tag (e.g. `src` only applies to `ImageTag`).
 */
export interface TagConfig {
  id?: string;
  text?: string;
  src?: string;
  href?: string;
  /** Heading level, only used by {@link HeadingTag} (defaults to 1). */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  classNames?: string[];
  attributes?: Record<string, string>;
  events?: Record<string, EventListener>;
  children?: HTMLElement[];
}

/** A creatable HTML element: a tag name, its configuration and a builder method. */
export interface Tag {
  toHtml(): HTMLElement;
}

/**
 * Shared implementation applying a {@link TagConfig} onto a given tag name
 * via {@link TagBuilder}. Concrete tags only need to supply the tag name.
 */
abstract class AbstractTag implements Tag {
  private tagName: string;
  protected config: TagConfig;

  protected constructor(tagName: string, config: TagConfig = {}) {
    this.tagName = tagName;
    this.config = config;
  }

  toHtml(): HTMLElement {
    const builder = new TagBuilder(this.tagName);

    if (this.config.text !== undefined) {
      builder.withText(this.config.text);
    }
    for (const className of this.config.classNames ?? []) {
      builder.withClass(className);
    }
    for (const [event, handler] of Object.entries(this.config.events ?? {})) {
      builder.withEvent(event, handler);
    }
    for (const child of this.config.children ?? []) {
      builder.withChild(child);
    }

    const element = builder.build();

    if (this.config.id !== undefined) {
      element.id = this.config.id;
    }
    if (this.config.src !== undefined) {
      element.setAttribute("src", this.config.src);
    }
    if (this.config.href !== undefined) {
      element.setAttribute("href", this.config.href);
    }
    for (const [name, value] of Object.entries(this.config.attributes ?? {})) {
      element.setAttribute(name, value);
    }

    return element;
  }
}

export class ButtonTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("button", config);
  }
}

export class DivTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("div", config);
  }
}

export class ImageTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("img", config);
  }
}

export class HorizontalRuleTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("hr", config);
  }
}

export class InputTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("input", config);
  }
}

export class HeadingTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super(`h${config.level ?? 1}`, config);
  }
}

export class SpanTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("span", config);
  }
}

export class ParagraphTag extends AbstractTag {
  constructor(config: TagConfig = {}) {
    super("p", config);
  }
}

/** Element types instantiable through {@link TagFactory.create}. */
export type ElementType =
  | "button"
  | "div"
  | "image"
  | "hr"
  | "input"
  | "heading"
  | "span"
  | "paragraph";

type TagConstructor = new (config?: TagConfig) => Tag;

const registry: Record<ElementType, TagConstructor> = {
  button: ButtonTag,
  div: DivTag,
  image: ImageTag,
  hr: HorizontalRuleTag,
  input: InputTag,
  heading: HeadingTag,
  span: SpanTag,
  paragraph: ParagraphTag,
};

/**
 * Concise entry point for creating the most common HTML elements, as an
 * alternative to chaining {@link TagBuilder} calls for simple cases.
 */
export class TagFactory {
  static create(type: ElementType, config: TagConfig = {}): Tag {
    const TagClass = registry[type];
    return new TagClass(config);
  }
}
