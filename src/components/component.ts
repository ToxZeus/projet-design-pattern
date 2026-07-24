import type { Observable, Unsubscribe } from "../core/observer.ts";

export type ComponentChild = Component | HTMLElement;
export type ComponentEventHandler<T = unknown> = (payload: T) => void;

export interface ComponentProps {
  children?: ComponentChild[];
}

/** Base class for DOM components with an explicit lifecycle and event channel. */
export abstract class Component<Props extends object = ComponentProps> {
  protected props: Props;
  private element: HTMLElement | undefined;
  private mounted = false;
  private cleanups = new Set<Unsubscribe>();
  private listeners = new Map<string, Set<ComponentEventHandler>>();

  constructor(props: Props) {
    this.props = props;
  }

  abstract render(): HTMLElement;

  protected onMount(): void {}

  protected onUpdate(_previousProps: Props): void {}

  protected onDestroy(): void {}

  mount(container: HTMLElement): HTMLElement {
    if (this.mounted && this.element) {
      return this.element;
    }

    this.element = this.render();
    container.appendChild(this.element);
    this.mounted = true;
    this.onMount();
    return this.element;
  }

  update(nextProps: Props): HTMLElement {
    const previousProps = this.props;
    this.props = nextProps;

    if (!this.mounted || !this.element) {
      return this.render();
    }

    const nextElement = this.render();
    this.element.replaceWith(nextElement);
    this.element = nextElement;
    this.onUpdate(previousProps);
    return nextElement;
  }

  destroy(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups.clear();

    if (!this.mounted) {
      return;
    }

    this.element?.remove();
    this.element = undefined;
    this.mounted = false;
    this.onDestroy();
  }

  getElement(): HTMLElement | undefined {
    return this.element;
  }

  protected track(cleanup: Unsubscribe): Unsubscribe {
    this.cleanups.add(cleanup);
    return () => {
      cleanup();
      this.cleanups.delete(cleanup);
    };
  }

  protected bind<T>(observable: Observable<T>, update: (value: T) => void): Unsubscribe {
    return this.track(observable.subscribe(update));
  }

  on<T>(event: string, handler: ComponentEventHandler<T>): Unsubscribe {
    const handlers = this.listeners.get(event) ?? new Set<ComponentEventHandler>();
    handlers.add(handler as ComponentEventHandler);
    this.listeners.set(event, handlers);

    return () => {
      handlers.delete(handler as ComponentEventHandler);
    };
  }

  protected emit<T>(event: string, payload: T): void {
    for (const handler of this.listeners.get(event) ?? []) {
      handler(payload);
    }
  }

  protected appendChildren(
    container: HTMLElement,
    children = (this.props as Props & ComponentProps).children,
  ): void {
    for (const child of children ?? []) {
      if (child instanceof Component) {
        child.mount(container);
      } else {
        container.appendChild(child);
      }
    }
  }
}
