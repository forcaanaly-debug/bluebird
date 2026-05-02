import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser, JwtUser } from "../common/decorators/current-user.decorator";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { PaymentProofDto } from "./dto/payment-proof.dto";

@Controller("bookings")
@UseGuards(AuthGuard("jwt"))
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateBookingDto) {
    return this.bookings.createRequest(user.sub, dto.tripId, dto.seats);
  }

  @Get("as-rider")
  asRider(@CurrentUser() user: JwtUser) {
    return this.bookings.listAsRider(user.sub);
  }

  @Get("driver-requests")
  driverRequests(@CurrentUser() user: JwtUser) {
    return this.bookings.listDriverRequests(user.sub);
  }

  @Patch(":id/accept")
  accept(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.bookings.accept(id, user.sub);
  }

  @Patch(":id/reject")
  reject(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.bookings.reject(id, user.sub);
  }

  @Post(":id/payment-proof")
  paymentProof(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: PaymentProofDto) {
    return this.bookings.submitPaymentProof(user.sub, id, dto);
  }

  @Patch(":id/cancel")
  cancel(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.bookings.cancelByRider(id, user.sub);
  }
}
