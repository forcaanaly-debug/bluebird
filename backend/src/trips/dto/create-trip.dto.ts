import { IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateTripDto {
  @IsString()
  @Length(2, 40)
  departureCity!: string;

  @IsString()
  @Length(2, 40)
  arrivalCity!: string;

  /** ISO date string YYYY-MM-DD */
  @IsString()
  @Length(10, 10)
  departureDate!: string;

  @IsString()
  @Length(4, 8)
  departureTime!: string;

  @IsInt()
  @Min(1)
  seatsAvailable!: number;

  @IsInt()
  @Min(0)
  farePerSeat!: number;

  @IsString()
  @Length(2, 24)
  vehicleType!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
