import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { OtpRequestDto, OtpVerifyDto, SocialAuthDto } from "./dto/otp.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("otp/request")
  requestOtp(@Body() dto: OtpRequestDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Throttle({ default: { limit: 12, ttl: 60000 } })
  @Post("otp/verify")
  verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.auth.verifyOtp(dto.phone, dto.code, dto.name);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post("social")
  social(@Body() dto: SocialAuthDto) {
    return this.auth.socialLogin(dto.provider, dto.idToken, dto.name);
  }

  @Get("google")
  async googleStart(@Query("returnUrl") returnUrl: string, @Res() res: Response) {
    const url = await this.auth.startGoogleOAuth(returnUrl ?? "");
    res.redirect(url);
  }

  @Get("google/callback")
  async googleCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response
  ) {
    try {
      const { accessToken, returnUrl } = await this.auth.finishGoogleOAuth(code, state);
      const dest = `${returnUrl}?token=${encodeURIComponent(accessToken)}`;
      res.redirect(dest);
    } catch {
      res.status(401).send("Google sign-in failed. Please close this window and try again.");
    }
  }
}
