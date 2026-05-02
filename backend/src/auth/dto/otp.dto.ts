import { IsOptional, IsString, Length, Matches } from "class-validator";

export class OtpRequestDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: "phone must be E.164 e.g. +923001234567" })
  phone!: string;
}

export class OtpVerifyDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/)
  phone!: string;

  @IsString()
  @Length(4, 8)
  code!: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;
}

export class SocialAuthDto {
  @IsString()
  @Matches(/^(google|apple)$/)
  provider!: "google" | "apple";

  @IsString()
  @Length(20, 4096)
  idToken!: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;
}
