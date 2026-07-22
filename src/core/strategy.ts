/**
 * Common contract for a key/value persistence backend.
 *
 * Every operation returns a `Promise` so that synchronous backends (memory,
 * `localStorage`) and asynchronous ones (`IndexedDB`) can be swapped at
 * runtime without changing the calling code.
 */
export interface StorageStrategy {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory storage strategy. Data lives only for the current page session
 * and is lost on reload — useful as a default/dev backend.
 */
export class VolatileStorage implements StorageStrategy {
  private store = new Map<string, unknown>();

  get<T>(key: string): Promise<T | undefined> {
    return Promise.resolve(this.store.get(key) as T | undefined);
  }

  set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.store.clear();
    return Promise.resolve();
  }
}

/**
 * Storage strategy backed by the browser's `localStorage`. Values are
 * serialized to JSON so any structured-cloneable value can be stored.
 */
export class LocalStorageAdapter implements StorageStrategy {
  private prefix: string;

  constructor(prefix = "app:") {
    this.prefix = prefix;
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): Promise<T | undefined> {
    const raw = window.localStorage.getItem(this.key(key));
    if (raw === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(raw) as T);
  }

  set<T>(key: string, value: T): Promise<void> {
    window.localStorage.setItem(this.key(key), JSON.stringify(value));
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    window.localStorage.removeItem(this.key(key));
    return Promise.resolve();
  }

  clear(): Promise<void> {
    for (const rawKey of Object.keys(window.localStorage)) {
      if (rawKey.startsWith(this.prefix)) {
        window.localStorage.removeItem(rawKey);
      }
    }
    return Promise.resolve();
  }
}

/**
 * Storage strategy backed by `IndexedDB`, suited for larger volumes of data.
 * A single object store (`keyValue`) is used as a flat key/value table.
 */
export class IndexedDBStorage implements StorageStrategy {
  private dbPromise: Promise<IDBDatabase> | undefined;
  private dbName: string;
  private storeName: string;

  constructor(dbName = "app-store", storeName = "keyValue") {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private open(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(this.storeName)) {
            request.result.createObjectStore(this.storeName);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  private async transaction(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.open();
    return db.transaction(this.storeName, mode).objectStore(this.storeName);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const store = await this.transaction("readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const store = await this.transaction("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async remove(key: string): Promise<void> {
    const store = await this.transaction("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const store = await this.transaction("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
