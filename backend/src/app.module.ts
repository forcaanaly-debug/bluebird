import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { DriversModule } from "./drivers/drivers.module";
import { TripsModule } from "./trips/trips.module";
import { BookingsModule } from "./bookings/bookings.module";
import { MessagesModule } from "./messages/messages.module";
import { AdminModule } from "./admin/admin.module";
import { HealthModule } from "./health/health.module";
import { OperatorModule } from "./operator/operator.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 20
      },
      {
        name: "medium",
        ttl: 60000,
        limit: 120
      }
    ]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    DriversModule,
    TripsModule,
    BookingsModule,
    MessagesModule,
    AdminModule,
    HealthModule,
    OperatorModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
