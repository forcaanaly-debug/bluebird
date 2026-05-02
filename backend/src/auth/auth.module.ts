import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { OtpDeliveryService } from "./otp-delivery.service";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const days = Number(config.get<string>("JWT_EXPIRES_DAYS") ?? 7);
        const expiresInSeconds = Math.max(1, days) * 24 * 60 * 60;
        return {
          secret: config.getOrThrow<string>("JWT_SECRET"),
          signOptions: { expiresIn: expiresInSeconds }
        };
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpDeliveryService],
  exports: [JwtModule, PassportModule, AuthService]
})
export class AuthModule {}
