import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser, JwtUser } from "../common/decorators/current-user.decorator";
import { CreateTripDto } from "./dto/create-trip.dto";
import { TripsService } from "./trips.service";

@Controller("trips")
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get("search")
  search(@Query("from") from?: string, @Query("to") to?: string, @Query("date") date?: string) {
    return this.trips.search(from, to, date);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateTripDto) {
    return this.trips.create(user.sub, dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("mine")
  mine(@CurrentUser() user: JwtUser) {
    return this.trips.listMine(user.sub);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id/cancel")
  cancel(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.trips.cancel(id, user.sub);
  }
}
