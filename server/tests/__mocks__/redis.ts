/**
 * Redis Mock for Testing
 *
 * Provides a simple in-memory Redis mock for testing
 */

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

  async set(key: string, value: string, options?: { EX?: number; NX?: boolean }): Promise<string | null> {
    if (options?.NX && this.store.has(key)) {
      return null;
    }
    this.store.set(key, { value, expireAt: options?.EX ? Date.now() + options.EX * 1000 : null });
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

  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.zsets.has(key)) {
      this.zsets.set(key, new Map());
    }

    const zset = this.zsets.get(key)!;
    const wasNew = !zset.has(member);
    zset.set(member, score);

    return wasNew ? 1 : 0;
  }

  async zscore(key: string, member: string): Promise<string | null> {
    const zset = this.zsets.get(key);
    if (!zset || !zset.has(member)) return null;

    return zset.get(member)!.toString();
  }

  async zrem(key: string, member: string): Promise<number> {
    const zset = this.zsets.get(key);
    if (!zset) return 0;

    return zset.delete(member) ? 1 : 0;
  }

  async zremRangeByScore(key: string, min: number | string, max: number | string): Promise<number> {
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

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    const zset = this.zsets.get(key);
    if (!zset) return [];

    const sorted = Array.from(zset.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([member]) => member);

    const endIndex = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, endIndex);
  }

  async zcard(key: string): Promise<number> {
    const zset = this.zsets.get(key);
    return zset ? zset.size : 0;
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

  on(event: string, callback: Function): void {
    // Mock event listener
  }
}

export const createClient = () => new RedisMock();

export type RedisClientType = RedisMock;

export default {
  createClient,
};
