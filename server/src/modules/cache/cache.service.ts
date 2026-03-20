import type { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

export const CACHE_KEYS = ["clientUrl"] as const;

export type CacheKeys = (typeof CACHE_KEYS)[number] | (string & {});

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: CacheKeys): Promise<T | null> {
    return (await this.cache.get<T>(key)) ?? null;
  }

  async set<T>(key: CacheKeys, value: T, ttl?: number) {
    await this.cache.set(key, value, ttl);
  }

  async del(key: CacheKeys) {
    await this.cache.del(key);
  }

  async wrap<T>(key: CacheKeys, factory: () => Promise<T>, ttl = 60 * 60) {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
