import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OtpDeliveryService {
  private readonly logger = new Logger(OtpDeliveryService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return this.twilioReady() || !!this.config.get<string>("OTP_WEBHOOK_URL")?.trim();
  }

  private twilioReady(): boolean {
    const sid = this.config.get<string>("TWILIO_ACCOUNT_SID")?.trim();
    const token = this.config.get<string>("TWILIO_AUTH_TOKEN")?.trim();
    const from = this.config.get<string>("TWILIO_PHONE_NUMBER")?.trim();
    return Boolean(sid && token && from);
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    if (this.twilioReady()) {
      await this.sendTwilio(phone, code);
      return;
    }
    const hook = this.config.get<string>("OTP_WEBHOOK_URL")?.trim();
    if (hook) {
      await this.sendWebhook(hook, phone, code);
      return;
    }
    throw new ServiceUnavailableException(
      "OTP delivery is not configured. Set TWILIO_* variables or OTP_WEBHOOK_URL."
    );
  }

  private async sendTwilio(phone: string, code: string): Promise<void> {
    const sid = this.config.get<string>("TWILIO_ACCOUNT_SID")!.trim();
    const token = this.config.get<string>("TWILIO_AUTH_TOKEN")!.trim();
    const from = this.config.get<string>("TWILIO_PHONE_NUMBER")!.trim();
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your BlueBird verification code is ${code}. It expires in a few minutes.`
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Twilio SMS failed: ${res.status} ${text}`);
      throw new BadGatewayException("SMS provider rejected the request");
    }
  }

  private async sendWebhook(url: string, phone: string, code: string): Promise<void> {
    const secret = this.config.get<string>("OTP_WEBHOOK_SECRET")?.trim();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {})
      },
      body: JSON.stringify({ phone, code })
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`OTP webhook failed: ${res.status} ${text}`);
      throw new BadGatewayException("OTP webhook rejected the request");
    }
  }
}
