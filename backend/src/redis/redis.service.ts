import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Thin ioredis wrapper. Lazily connects on first use and degrades to a
 * no-op cache if Redis is unavailable, so the API runs without it.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private available = true;

  private getClient(): Redis | null {
    if (!this.available) return null;
    if (!this.client) {
      try {
        this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: () => null, // do not endlessly retry
          enableOfflineQueue: false,
        });
        this.client.on('error', () => {
          // swallow — cache is best-effort
        });
        this.client.on('end', () => {
          this.available = false;
        });
      } catch {
        this.available = false;
        return null;
      }
    }
    return this.client;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const raw = await client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // no-op
    }
  }

  async del(...keys: string[]): Promise<void> {
    const client = this.getClient();
    if (!client || keys.length === 0) return;
    try {
      await client.del(...keys);
    } catch {
      // no-op
    }
  }

  /** Delete all keys matching a prefix (best-effort, used for cache busting). */
  async delPrefix(prefix: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    try {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length) await client.del(...keys);
    } catch {
      // no-op
    }
  }

  async onModuleDestroy() {
    try {
      await this.client?.quit();
    } catch {
      this.client?.disconnect();
    }
  }
}
