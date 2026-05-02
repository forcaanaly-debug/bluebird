import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>("REDIS_URL");
    if (url) {
      this.client = new Redis(url, { maxRetriesPerRequest: 2 });
    }
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  async setOtp(phone: string, code: string, ttlSeconds: number): Promise<void> {
    const key = `otp:${phone}`;
    if (this.client) {
      await this.client.set(key, code, "EX", ttlSeconds);
    } else {
      memoryOtp.set(phone, { code, expires: Date.now() + ttlSeconds * 1000 });
    }
  }

  async getOtp(phone: string): Promise<string | null> {
    const key = `otp:${phone}`;
    if (this.client) {
      return this.client.get(key);
    }
    const row = memoryOtp.get(phone);
    if (!row || row.expires < Date.now()) {
      memoryOtp.delete(phone);
      return null;
    }
    return row.code;
  }

  async delOtp(phone: string): Promise<void> {
    if (this.client) {
      await this.client.del(`otp:${phone}`);
    } else {
      memoryOtp.delete(phone);
    }
  }

  async setKey(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.client) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      memoryKv.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
    }
  }

  async getKey(key: string): Promise<string | null> {
    if (this.client) {
      return this.client.get(key);
    }
    const row = memoryKv.get(key);
    if (!row || row.expires < Date.now()) {
      memoryKv.delete(key);
      return null;
    }
    return row.value;
  }

  async delKey(key: string): Promise<void> {
    if (this.client) {
      await this.client.del(key);
    } else {
      memoryKv.delete(key);
    }
  }

  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      const p = await this.client.ping();
      return p === "PONG";
    } catch {
      return false;
    }
  }
}

const memoryOtp = new Map<string, { code: string; expires: number }>();
const memoryKv = new Map<string, { value: string; expires: number }>();
