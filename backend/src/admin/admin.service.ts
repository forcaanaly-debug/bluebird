import { Injectable, NotFoundException } from "@nestjs/common";
import { VerificationStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listPendingDrivers() {
    return this.prisma.driverProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: { user: { select: { id: true, phone: true, name: true } }, documents: true },
      orderBy: { createdAt: "asc" }
    });
  }

  async setDriverVerification(
    actorId: string,
    profileId: string,
    status: "APPROVED" | "REJECTED",
    reason?: string
  ) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException();

    const next =
      status === "APPROVED" ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;

    const updated = await this.prisma.driverProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: next,
        rejectionReason: status === "REJECTED" ? (reason ?? "Rejected") : null
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: "driver_verification",
        metadata: { profileId, status, reason: reason ?? null }
      }
    });

    return updated;
  }
}
