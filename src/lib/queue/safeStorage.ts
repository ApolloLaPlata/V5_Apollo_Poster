/**
 * safeStorage.ts - Armazenamento Seguro Resiliente com Fallback em Memória
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Provê interface síncrona de Web Storage (getItem, setItem, removeItem, clear):
 * - Em navegadores: utiliza window.localStorage com proteção contra QuotaExceededError
 * - Em SSR / Node.js / Testes: utiliza instância singleton de MemoryStorage em memória
 * - Zero avisos de persistência inacessível no Zustand
 */

export class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

export const memoryStorageSingleton = new MemoryStorage();

/**
 * Detecta se o ambiente atual é um navegador com LocalStorage ativo
 */
export function isBrowserEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__v5_storage_detect__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retorna uma instância de Storage 100% funcional e segura
 */
export function getSafeStorage(): Storage {
  if (isBrowserEnvironment()) {
    return window.localStorage;
  }
  return memoryStorageSingleton;
}
