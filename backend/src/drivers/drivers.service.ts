import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDriver(userId: string, vehicleType?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.role === Role.ADMIN) throw new BadRequestException("Admin cannot register as driver");

    const profile = await this.prisma.driverProfile.upsert({
      where: { userId },
      create: { userId, vehicleType: vehicleType ?? null },
      update: { vehicleType: vehicleType ?? undefined }
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.DRIVER }
    });

    return profile;
  }

  async addDocument(userId: string, docType: string, fileUrl: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException("Register as driver first");
    return this.prisma.driverDocument.create({
      data: { driverProfileId: profile.id, docType, fileUrl }
    });
  }

  async getProfileForUser(userId: string) {
    return this.prisma.driverProfile.findUnique({
      where: { userId },
      include: { documents: true }
    });
  }
}
