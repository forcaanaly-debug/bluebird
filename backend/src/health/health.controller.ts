import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  @Get()
  async health() {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    const redisOk = this.redis.isEnabled ? await this.redis.ping() : null;
    const ok = dbOk && (redisOk === null || redisOk === true);
    return {
      status: ok ? "ok" : "degraded",
      db: dbOk,
      redis: this.redis.isEnabled ? (redisOk ? "ok" : "down") : "skipped"
    };
  }
}
