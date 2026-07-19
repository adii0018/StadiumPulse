/**
 * @fileoverview Shared LRU cache service for all agent and RAG results.
 * Production upgrade path: Replace with Redis using ioredis with the same interface.
 */

import { LRUCache } from 'lru-cache';
import { env } from '../config/env';

/** Typed wrapper around lru-cache with TTL support */
class CacheService {
  private readonly cache: LRUCache<string, unknown>;

  constructor() {
    this.cache = new LRUCache({
      max: env.LRU_CACHE_MAX_SIZE,
      ttl: env.LRU_CACHE_TTL_MS,
    });
  }

  /**
   * Retrieves a value from cache.
   * @param key - Cache key (should be normalized before calling)
   * @returns The cached value or undefined if not present / expired
   */
  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  /**
   * Stores a value in cache with the default or override TTL.
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - Optional TTL in milliseconds
   */
  set<T>(key: string, value: T, ttl?: number): void {
    if (ttl !== undefined) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
  }

  /**
   * Removes a specific key from cache.
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears the entire cache. Used in tests and emergency resets.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns the number of entries currently in cache.
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Normalizes a query string to a consistent cache key.
   * Lowercases, trims, and collapses whitespace.
   * @param query - Raw query string
   */
  normalizeKey(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }
}

/** Singleton cache instance shared across all services */
export const cacheService = new CacheService();
