import { IsIn, IsOptional, IsString, Length } from "class-validator";

export class VerificationDto {
  @IsString()
  @IsIn(["APPROVED", "REJECTED"])
  status!: "APPROVED" | "REJECTED";

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
