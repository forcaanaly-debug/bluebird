import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driverProfile: true }
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async updateMe(userId: string, name?: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: name ?? undefined }
    });
  }
}
