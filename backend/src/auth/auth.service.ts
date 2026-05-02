import * as crypto from "crypto";
import { HttpException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { OtpDeliveryService } from "./otp-delivery.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient = new OAuth2Client();
  private readonly appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly otpDelivery: OtpDeliveryService
  ) {}

  private isProduction(): boolean {
    return this.config.get<string>("NODE_ENV") === "production";
  }

  private normalizedDevOtp(): string | undefined {
    const raw = this.config.get<string>("DEV_OTP");
    const t = raw?.trim();
    return t ? t : undefined;
  }

  async requestOtp(phone: string): Promise<{ ok: true }> {
    const devOtp = this.normalizedDevOtp();
    const useFixedDevOtp = !this.isProduction() && devOtp !== undefined;
    const code = useFixedDevOtp ? devOtp! : String(Math.floor(100000 + Math.random() * 900000));
    const ttl = Number(this.config.get("OTP_TTL_SECONDS") ?? 300);
    await this.redis.setOtp(phone, code, ttl);

    if (this.isProduction()) {
      await this.otpDelivery.sendOtp(phone, code);
    } else if (this.otpDelivery.isConfigured()) {
      await this.otpDelivery.sendOtp(phone, code);
    } else {
      this.logger.log(`OTP for ${phone}: ${code} (no SMS provider; configure Twilio or OTP_WEBHOOK_URL for delivery)`);
    }
    return { ok: true };
  }

  async verifyOtp(phone: string, code: string, name?: string) {
    const stored = await this.redis.getOtp(phone);
    const devOtp = this.normalizedDevOtp();
    const allowDevBypass = !this.isProduction() && devOtp !== undefined;
    const ok = stored === code || (allowDevBypass && code === devOtp);
    if (!ok) {
      throw new UnauthorizedException("Invalid code");
    }
    await this.redis.delOtp(phone);

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, name: name ?? null }
      });
    } else if (name) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user };
  }

  async socialLogin(provider: "google" | "apple", idToken: string, name?: string) {
    const { providerUserId, providerName } = await this.verifySocialToken(provider, idToken);
    const socialPhone = this.buildSocialPhone(provider, providerUserId);
    let user = await this.prisma.user.findUnique({ where: { phone: socialPhone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: socialPhone,
          name: name ?? providerName ?? `${provider[0].toUpperCase()}${provider.slice(1)} User`
        }
      });
    } else if (name) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user };
  }

  private buildSocialPhone(provider: "google" | "apple", providerUserId: string): string {
    const prefix = provider === "google" ? "991" : "992";
    const digits = Array.from(providerUserId).reduce((acc, char, index) => {
      const value = char.charCodeAt(0) * (index + 3);
      return (acc + value) % 1_000_000_000;
    }, 0);
    const suffix = String(digits).padStart(9, "0");
    return `+${prefix}${suffix}`;
  }

  private async verifySocialToken(
    provider: "google" | "apple",
    idToken: string
  ): Promise<{ providerUserId: string; providerName?: string }> {
    if (provider === "google") {
      const audiences = this.getAudienceList("GOOGLE_AUTH_AUDIENCES");
      if (!audiences.length) {
        throw new UnauthorizedException("Google auth audience is not configured");
      }
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken,
          audience: audiences
        });
        const payload = ticket.getPayload();
        if (!payload?.sub) throw new UnauthorizedException("Invalid Google token");
        const providerName =
          [payload.given_name, payload.family_name].filter(Boolean).join(" ").trim() || payload.name || undefined;
        return { providerUserId: payload.sub, providerName };
      } catch (error) {
        if (error instanceof HttpException) throw error;
        const message = error instanceof Error ? error.message : "Google token verification failed";
        throw new UnauthorizedException(`Google token verification failed: ${message}`);
      }
    }

    const audiences = this.getAudienceList("APPLE_AUTH_AUDIENCES");
    if (!audiences.length) {
      throw new UnauthorizedException("Apple auth audience is not configured");
    }
    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(idToken, this.appleJwks, {
        issuer: "https://appleid.apple.com",
        audience: audiences
      });
      payload = verified.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Apple token verification failed";
      throw new UnauthorizedException(`Apple token verification failed: ${message}`);
    }
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") {
      throw new UnauthorizedException("Invalid Apple token");
    }
    return { providerUserId: sub, providerName: this.pickPayloadName(payload) };
  }

  async startGoogleOAuth(returnUrl: string): Promise<string> {
    const clientId = this.config.get<string>("GOOGLE_WEB_CLIENT_ID");
    const callbackUri = this.config.get<string>("GOOGLE_CALLBACK_URI");
    if (!clientId || !callbackUri) {
      throw new Error("GOOGLE_WEB_CLIENT_ID or GOOGLE_CALLBACK_URI not configured");
    }

    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    const state = crypto.randomBytes(16).toString("hex");

    await this.redis.setKey(
      `oauth:${state}`,
      JSON.stringify({ codeVerifier, returnUrl }),
      300
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUri,
      response_type: "code",
      scope: "openid profile email",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "offline",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async finishGoogleOAuth(code: string, state: string): Promise<{ accessToken: string; returnUrl: string }> {
    const raw = await this.redis.getKey(`oauth:${state}`);
    if (!raw) throw new UnauthorizedException("OAuth state expired or invalid");
    await this.redis.delKey(`oauth:${state}`);

    const { codeVerifier, returnUrl } = JSON.parse(raw) as { codeVerifier: string; returnUrl: string };

    const clientId = this.config.get<string>("GOOGLE_WEB_CLIENT_ID")!;
    const clientSecret = this.config.get<string>("GOOGLE_CLIENT_SECRET");
    const callbackUri = this.config.get<string>("GOOGLE_CALLBACK_URI")!;

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: callbackUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    });
    if (clientSecret) body.set("client_secret", clientSecret);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const tokens = (await tokenRes.json()) as { id_token?: string; error?: string };
    if (!tokens.id_token) {
      this.logger.error("Google token exchange failed", tokens);
      throw new UnauthorizedException(tokens.error ?? "Google token exchange failed");
    }

    const { access_token } = await this.socialLogin("google", tokens.id_token);
    return { accessToken: access_token, returnUrl };
  }

  private getAudienceList(envKey: string): string[] {
    const raw = this.config.get<string>(envKey) ?? "";
    return raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private pickPayloadName(payload: JWTPayload): string | undefined {
    const given = payload.given_name;
    const family = payload.family_name;
    const combined = [given, family].filter((v): v is string => typeof v === "string" && !!v).join(" ").trim();
    if (combined) return combined;
    if (typeof payload.name === "string" && payload.name.trim()) return payload.name.trim();
    return undefined;
  }
}
