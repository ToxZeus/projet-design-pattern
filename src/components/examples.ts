import { TagBuilder } from "../core/builder.ts";
import { Component, type ComponentChild, type ComponentProps } from "./component.ts";

export interface CardProps extends ComponentProps {
  title?: string;
}

export class Card extends Component<CardProps> {
  render(): HTMLElement {
    const card = new TagBuilder("article").withClass("component-card").build();
    if (this.props.title) {
      card.appendChild(new TagBuilder("h2").withText(this.props.title).build());
    }

    const content = new TagBuilder("div").withClass("component-card__content").build();
    this.appendChildren(content);
    card.appendChild(content);
    return card;
  }
}

export interface ListProps<T> extends ComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => ComponentChild;
  onSelect?: (item: T, index: number) => void;
}

export class List<T> extends Component<ListProps<T>> {
  render(): HTMLElement {
    const list = new TagBuilder("ul").withClass("component-list").build();
    for (const [index, item] of this.props.items.entries()) {
      const itemElement = new TagBuilder("li").withClass("component-list__item").build();
      const child = this.props.renderItem(item, index);
      if (child instanceof Component) {
        child.mount(itemElement);
      } else {
        itemElement.appendChild(child);
      }
      itemElement.addEventListener("click", () => this.props.onSelect?.(item, index));
      list.appendChild(itemElement);
    }
    return list;
  }
}

export interface ModalProps extends ComponentProps {
  title: string;
  open?: boolean;
  onClose?: () => void;
}

export class Modal extends Component<ModalProps> {
  render(): HTMLElement {
    const modal = new TagBuilder("dialog").withClass("component-modal").build() as HTMLDialogElement;
    modal.open = this.props.open ?? false;

    const header = new TagBuilder("header").withClass("component-modal__header").build();
    header.appendChild(new TagBuilder("h2").withText(this.props.title).build());
    const closeButton = new TagBuilder("button")
      .withText("Fermer")
      .withEvent("click", () => this.props.onClose?.())
      .build();
    header.appendChild(closeButton);
    modal.appendChild(header);

    const content = new TagBuilder("div").withClass("component-modal__content").build();
    this.appendChildren(content);
    modal.appendChild(content);
    return modal;
  }
}
