import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IsOptional, IsString, Length } from "class-validator";
import { CurrentUser, JwtUser } from "../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;
}

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.users.getMe(user.sub);
  }

  @Patch("me")
  patchMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(user.sub, dto.name);
  }
}
