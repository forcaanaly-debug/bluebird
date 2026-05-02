import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser, JwtUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminService } from "./admin.service";
import { VerificationDto } from "./dto/verification.dto";

@Controller("admin")
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("drivers/pending")
  pendingDrivers() {
    return this.admin.listPendingDrivers();
  }

  @Patch("drivers/:profileId/verification")
  verify(
    @CurrentUser() user: JwtUser,
    @Param("profileId") profileId: string,
    @Body() dto: VerificationDto
  ) {
    return this.admin.setDriverVerification(user.sub, profileId, dto.status, dto.reason);
  }
}
