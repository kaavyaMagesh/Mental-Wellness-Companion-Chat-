// services/cache.service.js

class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Fetch item from cache
   * @param {string} key 
   * @returns {any|null} returns null if expired or missing
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const item = this.cache.get(key);
    const now = Date.now();

    if (now > item.expiresAt) {
      // TTL Expired: clean up memory
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Save item to cache
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds Time-to-live in seconds
   */
  set(key, value, ttlSeconds = 900) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Delete an item from cache
   * @param {string} key 
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all items in cache
   */
  clear() {
    this.cache.clear();
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
