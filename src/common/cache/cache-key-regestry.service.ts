import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheKeyRegistry {
  private keyMap = new Map<string, Set<string>>();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Register a cache key under a namespace
  async set(key: string, value: any, ttl?: number, namespace?: string): Promise<void> {
    await this.cacheManager.set(key, value, ttl);

    // Track the key
    if (namespace) {
      if (!this.keyMap.has(namespace)) {
        this.keyMap.set(namespace, new Set());
      }
      this.keyMap.get(namespace)!.add(key);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);

    for (const [namespace, keys] of this.keyMap.entries()) {
      if (keys.has(key)) {
        keys.delete(key);
      }
    }
  }

  async clearNamespace(namespace: string): Promise<void> {
    const keys = this.keyMap.get(namespace);
    if (!keys) {
      return;
    }

    await Promise.all(Array.from(keys).map((key) => this.cacheManager.del(key)));
    this.keyMap.delete(namespace);
  }
}
