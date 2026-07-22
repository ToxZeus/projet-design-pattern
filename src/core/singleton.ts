import { VolatileStorage, type StorageStrategy } from "./strategy.ts";

/**
 * Global application configuration, shared across the app without being
 * threaded through every component's constructor.
 */
export class AppConfig {
  private static instance: AppConfig | undefined;
  private config: Record<string, string> = {};

  private constructor() {}

  /** Returns the unique `AppConfig` instance, creating it on first call. */
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  set(key: string, value: string): void {
    this.config[key] = value;
  }

  get(key: string): string | undefined {
    return this.config[key];
  }
}

/**
 * Global application state store. Delegates persistence to a
 * {@link StorageStrategy} which can be swapped at runtime via
 * {@link AppStore.setStrategy}.
 */
export class AppStore {
  private static instance: AppStore | undefined;
  private state: Record<string, unknown> = {};
  private strategy: StorageStrategy;

  private constructor(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  /**
   * Returns the unique `AppStore` instance, creating it on first call.
   * `strategy` is only used the first time the instance is created.
   */
  static getInstance(strategy?: StorageStrategy): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore(strategy ?? new VolatileStorage());
    }
    return AppStore.instance;
  }

  getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  /** Updates the in-memory state and persists it through the current strategy. */
  async setState(key: string, value: unknown): Promise<void> {
    this.state[key] = value;
    await this.strategy.set(key, value);
  }

  /** Reloads `key` from the current storage strategy into memory, if present. */
  async hydrate(key: string): Promise<void> {
    const value = await this.strategy.get(key);
    if (value !== undefined) {
      this.state[key] = value;
    }
  }

  /** Swaps the persistence backend used for future `setState`/`hydrate` calls. */
  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }
}
