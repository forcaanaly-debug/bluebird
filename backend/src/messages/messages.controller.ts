import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IsString, Length } from "class-validator";
import { CurrentUser, JwtUser } from "../common/decorators/current-user.decorator";
import { MessagesService } from "./messages.service";

class PostMessageDto {
  @IsString()
  @Length(1, 2000)
  body!: string;
}

@Controller("trips")
@UseGuards(AuthGuard("jwt"))
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get(":tripId/messages")
  list(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.messages.list(tripId, user.sub);
  }

  @Post(":tripId/messages")
  post(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string, @Body() dto: PostMessageDto) {
    return this.messages.post(tripId, user.sub, dto.body);
  }
}
