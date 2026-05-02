import { IsOptional, IsString, Length } from "class-validator";

export class PaymentProofDto {
  @IsString()
  @Length(2, 40)
  method!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  reference?: string;

  @IsOptional()
  @IsString()
  @Length(4, 500)
  proofUrl?: string;
}
