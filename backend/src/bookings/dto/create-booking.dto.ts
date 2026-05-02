import { IsInt, IsString, Length, Min } from "class-validator";

export class CreateBookingDto {
  @IsString()
  @Length(10, 40)
  tripId!: string;

  @IsInt()
  @Min(1)
  seats!: number;
}
