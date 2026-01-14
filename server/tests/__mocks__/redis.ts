/**
 * Redis Mock for Testing
 *
 * Provides a simple in-memory Redis mock for testing
 * Uses Redis v4 camelCase method names
 */

type ZAddMember = { score: number; value: string };

class MultiMock {
  private commands: Array<() => Promise<any>> = [];

  constructor(private redis: RedisMock) {}

  set(key: string, value: string): this {
    this.commands.push(async () => {
      return await this.redis.set(key, value);
    });
    return this;
  }

  setEx(key: string, seconds: number, value: string): this {
    this.commands.push(async () => {
      return await this.redis.setEx(key, seconds, value);
    });
    return this;
  }

  del(key: string | string[]): this {
    this.commands.push(async () => {
      return await this.redis.del(key);
    });
    return this;
  }

  get(key: string): this {
    this.commands.push(async () => {
      return await this.redis.get(key);
    });
    return this;
  }

  incr(key: string): this {
    this.commands.push(async () => {
      return await this.redis.incr(key);
    });
    return this;
  }

  expire(key: string, seconds: number): this {
    this.commands.push(async () => {
      return await this.redis.expire(key, seconds);
    });
    return this;
  }

  zAdd(key: string, members: ZAddMember | ZAddMember[]): this {
    this.commands.push(async () => {
      return await this.redis.zAdd(key, members);
    });
    return this;
  }

  zRem(key: string, member: string | string[]): this {
    this.commands.push(async () => {
      return await this.redis.zRem(key, member);
    });
    return this;
  }

  rPush(key: string, ...values: string[]): this {
    this.commands.push(async () => {
      return await this.redis.rPush(key, ...values);
    });
    return this;
  }

  lPush(key: string, ...values: string[]): this {
    this.commands.push(async () => {
      return await this.redis.lPush(key, ...values);
    });
    return this;
  }

  lTrim(key: string, start: number, stop: number): this {
    this.commands.push(async () => {
      return await this.redis.lTrim(key, start, stop);
    });
    return this;
  }

  lRange(key: string, start: number, stop: number): this {
    this.commands.push(async () => {
      return await this.redis.lRange(key, start, stop);
    });
    return this;
  }

  async exec(): Promise<Array<any> | null> {
    // Execute all queued commands and return results
    const results: Array<any> = [];

    for (const cmd of this.commands) {
      try {
        const result = await cmd();
        results.push(result);
      } catch (error) {
        results.push(null);
      }
    }

    return results;
  }
}

class RedisMock {
  private store: Map<string, any> = new Map();
  private zsets: Map<string, Map<string, number>> = new Map();
  isOpen: boolean = false;

  async connect(): Promise<void> {
    this.isOpen = true;
  }

  async quit(): Promise<void> {
    this.isOpen = false;
    this.store.clear();
    this.zsets.clear();
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async set(key: string, value: string, options?: { EX?: number; PX?: number; NX?: boolean }): Promise<string | null> {
    if (options?.NX && this.store.has(key)) {
      return null;
    }
    const ttlMs = options?.PX || (options?.EX ? options.EX * 1000 : null);
    this.store.set(key, { value, expireAt: ttlMs ? Date.now() + ttlMs : null });
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    const data = this.store.get(key);
    if (!data) return null;

    if (data.expireAt && Date.now() > data.expireAt) {
      this.store.delete(key);
      return null;
    }

    return data.value;
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;

    for (const k of keys) {
      if (this.store.delete(k)) count++;
    }

    return count;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const data = this.store.get(key);
    if (!data) return 0;

    data.expireAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const data = this.store.get(key);
    if (!data) return -2;
    if (!data.expireAt) return -1;

    const remaining = Math.floor((data.expireAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  // Redis v4 camelCase method - accepts { score, value } objects
  async zAdd(key: string, members: ZAddMember | ZAddMember[]): Promise<number> {
    if (!this.zsets.has(key)) {
      this.zsets.set(key, new Map());
    }

    const zset = this.zsets.get(key)!;
    const memberArray = Array.isArray(members) ? members : [members];
    let added = 0;

    for (const { score, value } of memberArray) {
      const wasNew = !zset.has(value);
      zset.set(value, score);
      if (wasNew) added++;
    }

    return added;
  }

  // Backward compatibility alias
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.zAdd(key, { score, value: member });
  }

  // Redis v4 camelCase method
  async zScore(key: string, member: string): Promise<number | null> {
    const zset = this.zsets.get(key);
    if (!zset || !zset.has(member)) return null;

    return zset.get(member)!;
  }

  // Backward compatibility alias
  async zscore(key: string, member: string): Promise<string | null> {
    const score = await this.zScore(key, member);
    return score !== null ? score.toString() : null;
  }

  // Redis v4 camelCase method
  async zRem(key: string, member: string | string[]): Promise<number> {
    const zset = this.zsets.get(key);
    if (!zset) return 0;

    const members = Array.isArray(member) ? member : [member];
    let removed = 0;

    for (const m of members) {
      if (zset.delete(m)) removed++;
    }

    return removed;
  }

  // Backward compatibility alias
  async zrem(key: string, member: string): Promise<number> {
    return this.zRem(key, member);
  }

  // Redis v4 camelCase method
  async zRemRangeByScore(key: string, min: number | string, max: number | string): Promise<number> {
    const zset = this.zsets.get(key);
    if (!zset) return 0;

    const minScore = min === '-inf' ? -Infinity : Number(min);
    const maxScore = max === '+inf' ? Infinity : Number(max);

    let removed = 0;
    for (const [member, score] of zset.entries()) {
      if (score >= minScore && score <= maxScore) {
        zset.delete(member);
        removed++;
      }
    }

    return removed;
  }

  // Backward compatibility alias
  async zremRangeByScore(key: string, min: number | string, max: number | string): Promise<number> {
    return this.zRemRangeByScore(key, min, max);
  }

  // Redis v4 camelCase method with options support
  async zRange(key: string, start: number, stop: number, options?: { REV?: boolean; WITHSCORES?: boolean }): Promise<string[] | Array<{ value: string; score: number }>> {
    const zset = this.zsets.get(key);
    if (!zset) return [];

    let sorted = Array.from(zset.entries())
      .sort((a, b) => a[1] - b[1]);

    if (options?.REV) {
      sorted = sorted.reverse();
    }

    const endIndex = stop === -1 ? sorted.length : stop + 1;
    const slice = sorted.slice(start, endIndex);

    if (options?.WITHSCORES) {
      return slice.map(([value, score]) => ({ value, score }));
    }

    return slice.map(([value]) => value);
  }

  // Backward compatibility alias
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.zRange(key, start, stop) as Promise<string[]>;
  }

  // Redis v4 camelCase method
  async zCard(key: string): Promise<number> {
    const zset = this.zsets.get(key);
    return zset ? zset.size : 0;
  }

  // Backward compatibility alias
  async zcard(key: string): Promise<number> {
    return this.zCard(key);
  }

  // Additional sorted set methods for Redis v4 compatibility
  async zRank(key: string, member: string): Promise<number | null> {
    const zset = this.zsets.get(key);
    if (!zset || !zset.has(member)) return null;

    const sorted = Array.from(zset.entries())
      .sort((a, b) => a[1] - b[1]);

    const index = sorted.findIndex(([m]) => m === member);
    return index >= 0 ? index : null;
  }

  async zRevRank(key: string, member: string): Promise<number | null> {
    const zset = this.zsets.get(key);
    if (!zset || !zset.has(member)) return null;

    const sorted = Array.from(zset.entries())
      .sort((a, b) => b[1] - a[1]);

    const index = sorted.findIndex(([m]) => m === member);
    return index >= 0 ? index : null;
  }

  async zCount(key: string, min: number | string, max: number | string): Promise<number> {
    const zset = this.zsets.get(key);
    if (!zset) return 0;

    const minScore = min === '-inf' ? -Infinity : Number(min);
    const maxScore = max === '+inf' ? Infinity : Number(max);

    let count = 0;
    for (const score of zset.values()) {
      if (score >= minScore && score <= maxScore) {
        count++;
      }
    }

    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async flushAll(): Promise<string> {
    this.store.clear();
    this.zsets.clear();
    return 'OK';
  }

  async flushDb(): Promise<string> {
    // Alias for flushAll in mock (in real Redis they're different for multi-db)
    this.store.clear();
    this.zsets.clear();
    return 'OK';
  }

  async setEx(key: string, seconds: number, value: string): Promise<string> {
    // Set key with expiration time in seconds
    this.store.set(key, { value, expireAt: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    // Get a range of elements from a list
    const data = this.store.get(key);
    if (!data || !Array.isArray(data.value)) return [];

    const list = data.value as string[];
    const endIndex = stop === -1 ? list.length : stop + 1;
    return list.slice(start, endIndex);
  }

  async lPush(key: string, ...values: string[]): Promise<number> {
    // Prepend values to a list
    const data = this.store.get(key);
    const list = data && Array.isArray(data.value) ? data.value : [];

    // Add values to the beginning (reverse order to match Redis behavior)
    for (let i = values.length - 1; i >= 0; i--) {
      list.unshift(values[i]);
    }

    this.store.set(key, { value: list, expireAt: data?.expireAt || null });
    return list.length;
  }

  async rPush(key: string, ...values: string[]): Promise<number> {
    // Append values to a list
    const data = this.store.get(key);
    const list = data && Array.isArray(data.value) ? data.value : [];

    list.push(...values);

    this.store.set(key, { value: list, expireAt: data?.expireAt || null });
    return list.length;
  }

  async scan(cursor: number, options?: { MATCH?: string; COUNT?: number }): Promise<{ cursor: number; keys: string[] }> {
    const pattern = options?.MATCH || '*';
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const allKeys = Array.from(this.store.keys());
    const matchingKeys = allKeys.filter(key => regex.test(key));

    // Simple mock implementation: return all keys in one go if cursor is 0
    if (cursor === 0) {
      return { cursor: 0, keys: matchingKeys };
    }
    return { cursor: 0, keys: [] };
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    const result: (string | null)[] = [];
    for (const key of keys) {
      result.push(await this.get(key));
    }
    return result;
  }

  // Proper multi() implementation with chainable methods
  multi(): MultiMock {
    return new MultiMock(this);
  }

  async watch(key: string | string[]): Promise<string> {
    // Simple mock - just acknowledge the watch
    return 'OK';
  }

  async unwatch(): Promise<string> {
    return 'OK';
  }

  async eval(script: string, options?: { keys?: string[]; arguments?: string[] }): Promise<any> {
    // Simple mock for lock release script used in distributedLock.ts
    if (script.includes('if redis.call("get", KEYS[1]) == ARGV[1] then')) {
      const key = options?.keys?.[0];
      const token = options?.arguments?.[0];
      if (key && token) {
        const current = await this.get(key);
        if (current === token) {
          await this.del(key);
          return 1;
        }
      }
      return 0;
    }
    return null;
  }

  async incr(key: string): Promise<number> {
    const data = this.store.get(key);
    const value = data ? parseInt(data.value, 10) + 1 : 1;
    this.store.set(key, { value: value.toString(), expireAt: data?.expireAt || null });
    return value;
  }

  async decr(key: string): Promise<number> {
    const data = this.store.get(key);
    const value = data ? parseInt(data.value, 10) - 1 : -1;
    this.store.set(key, { value: value.toString(), expireAt: data?.expireAt || null });
    return value;
  }

  async sendCommand(args: string[]): Promise<any> {
    // Mock implementation for rate-limit-redis scripts
    const command = args[0]?.toUpperCase();

    if (command === 'SCRIPT' && args[1]?.toUpperCase() === 'LOAD') {
      // Return a fake SHA1 hash for script load
      return 'mock_script_sha_' + Math.random().toString(36).substr(2, 9);
    }

    if (command === 'EVALSHA') {
      // Rate limit script execution - return [current_count, ttl_remaining]
      // First arg is sha, second is numKeys, then keys and args
      const numKeys = parseInt(args[2], 10) || 1;
      const key = args[3]; // First key

      // Simulate rate limit: return current count and TTL
      const data = this.store.get(key);
      const count = data ? parseInt(data.value, 10) : 0;

      // Return format expected by rate-limit-redis: [totalHits, resetTime]
      return [count + 1, Date.now() + 60000];
    }

    // Default response
    return 1;
  }

  // Script-related methods for rate-limit-redis
  async evalSha(sha: string, options?: { keys?: string[]; arguments?: string[] }): Promise<any> {
    // Mock evalSha - used by rate-limit-redis
    const key = options?.keys?.[0] || 'rate_limit';

    // Increment the counter and return [count, ttl]
    const count = await this.incr(key);

    // Return format: [totalHits, resetTime]
    return [count, Date.now() + 60000];
  }

  async scriptLoad(script: string): Promise<string> {
    // Return a mock SHA1 hash for the script
    return 'mock_script_sha_' + Math.random().toString(36).substr(2, 9);
  }

  async lLen(key: string): Promise<number> {
    // Get length of a list
    const data = this.store.get(key);
    if (!data || !Array.isArray(data.value)) return 0;
    return data.value.length;
  }

  async lTrim(key: string, start: number, stop: number): Promise<string> {
    // Trim a list to the specified range
    const data = this.store.get(key);
    if (!data || !Array.isArray(data.value)) return 'OK';

    const list = data.value as string[];
    const endIndex = stop === -1 ? list.length : stop + 1;
    const trimmed = list.slice(start, endIndex);

    this.store.set(key, { value: trimmed, expireAt: data.expireAt });
    return 'OK';
  }

  // Hash operations
  async hSet(key: string, field: string, value: string): Promise<number> {
    let hash = this.store.get(key);
    if (!hash || typeof hash.value !== 'object' || hash.value === null || Array.isArray(hash.value)) {
      hash = { value: {}, expireAt: null };
      this.store.set(key, hash);
    }
    const wasNew = !(field in hash.value);
    hash.value[field] = value;
    return wasNew ? 1 : 0;
  }

  async hGet(key: string, field: string): Promise<string | null> {
    const hash = this.store.get(key);
    if (!hash || typeof hash.value !== 'object' || hash.value === null || Array.isArray(hash.value)) {
      return null;
    }
    return hash.value[field] ?? null;
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    const hash = this.store.get(key);
    if (!hash || typeof hash.value !== 'object' || hash.value === null || Array.isArray(hash.value)) {
      return {};
    }
    return { ...hash.value };
  }

  async hDel(key: string, ...fields: string[]): Promise<number> {
    const hash = this.store.get(key);
    if (!hash || typeof hash.value !== 'object' || hash.value === null || Array.isArray(hash.value)) {
      return 0;
    }
    let deleted = 0;
    for (const field of fields) {
      if (field in hash.value) {
        delete hash.value[field];
        deleted++;
      }
    }
    return deleted;
  }

  // Set operations
  async sAdd(key: string, ...members: string[]): Promise<number> {
    let data = this.store.get(key);
    if (!data || !(data.value instanceof Set)) {
      data = { value: new Set<string>(), expireAt: null };
      this.store.set(key, data);
    }
    let added = 0;
    for (const member of members) {
      if (!data.value.has(member)) {
        data.value.add(member);
        added++;
      }
    }
    return added;
  }

  async sRem(key: string, ...members: string[]): Promise<number> {
    const data = this.store.get(key);
    if (!data || !(data.value instanceof Set)) {
      return 0;
    }
    let removed = 0;
    for (const member of members) {
      if (data.value.delete(member)) {
        removed++;
      }
    }
    return removed;
  }

  async sMembers(key: string): Promise<string[]> {
    const data = this.store.get(key);
    if (!data || !(data.value instanceof Set)) {
      return [];
    }
    return Array.from(data.value);
  }

  async sIsMember(key: string, member: string): Promise<number> {
    const data = this.store.get(key);
    if (!data || !(data.value instanceof Set)) {
      return 0;
    }
    return data.value.has(member) ? 1 : 0;
  }

  on(event: string, callback: Function): void {
    // Mock event listener - no-op for tests
  }

  removeListener(event: string, callback: Function): void {
    // Mock removeListener - no-op for tests
  }

  // Pub/sub stubs
  async publish(channel: string, message: string): Promise<number> {
    // Mock - return number of subscribers (0 for mock)
    return 0;
  }

  async subscribe(channel: string, callback?: (message: string) => void): Promise<void> {
    // Mock - do nothing
  }

  async unsubscribe(channel?: string): Promise<void> {
    // Mock - do nothing
  }
}

export const createClient = () => new RedisMock();

export type RedisClientType = RedisMock;

export default {
  createClient,
};
