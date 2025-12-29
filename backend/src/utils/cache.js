// In-memory cache for PoC (Redis-ready architecture)
// For production, replace with Redis client

class Cache {
    constructor() {
        this.store = new Map();
        this.ttl = new Map(); // Time-to-live tracking
    }

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;

        const expiresAt = this.ttl.get(key);
        if (expiresAt && Date.now() > expiresAt) {
            this.delete(key);
            return null;
        }

        return item;
    }

    set(key, value, ttlSeconds = null) {
        this.store.set(key, value);
        if (ttlSeconds) {
            this.ttl.set(key, Date.now() + ttlSeconds * 1000);
        }
    }

    delete(key) {
        this.store.delete(key);
        this.ttl.delete(key);
    }

    clear() {
        this.store.clear();
        this.ttl.clear();
    }

    // Redis-compatible methods for easy migration
    async getAsync(key) {
        return Promise.resolve(this.get(key));
    }

    async setAsync(key, value, ttlSeconds = null) {
        return Promise.resolve(this.set(key, value, ttlSeconds));
    }

    async deleteAsync(key) {
        return Promise.resolve(this.delete(key));
    }
}

// Export singleton instance
export default new Cache();

// For future Redis migration:
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);
// export default {
//   getAsync: (key) => redis.get(key).then(v => v ? JSON.parse(v) : null),
//   setAsync: (key, value, ttl) => redis.setex(key, ttl, JSON.stringify(value)),
//   deleteAsync: (key) => redis.del(key),
// };

