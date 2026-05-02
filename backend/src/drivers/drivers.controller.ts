import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IsOptional, IsString, Length, IsUrl } from "class-validator";
import { CurrentUser, JwtUser } from "../common/decorators/current-user.decorator";
import { DriversService } from "./drivers.service";

class RegisterDriverDto {
  @IsOptional()
  @IsString()
  @Length(1, 40)
  vehicleType?: string;
}

class AddDocumentDto {
  @IsString()
  @Length(2, 40)
  docType!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  fileUrl!: string;
}

@Controller("drivers")
@UseGuards(AuthGuard("jwt"))
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  @Post("register")
  register(@CurrentUser() user: JwtUser, @Body() dto: RegisterDriverDto) {
    return this.drivers.registerDriver(user.sub, dto.vehicleType);
  }

  @Post("documents")
  addDoc(@CurrentUser() user: JwtUser, @Body() dto: AddDocumentDto) {
    return this.drivers.addDocument(user.sub, dto.docType, dto.fileUrl);
  }

  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.drivers.getProfileForUser(user.sub);
  }
}
