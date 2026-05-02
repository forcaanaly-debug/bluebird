import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertTripAccess(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { driverProfile: true }
    });
    if (!trip) throw new NotFoundException();
    const isDriver = trip.driverProfile.userId === userId;
    const booking = await this.prisma.booking.findFirst({
      where: {
        tripId,
        riderId: userId,
        status: { in: [BookingStatus.REQUESTED, BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
      }
    });
    if (!isDriver && !booking) throw new ForbiddenException();
  }

  async list(tripId: string, userId: string) {
    await this.assertTripAccess(tripId, userId);
    return this.prisma.message.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true } } }
    });
  }

  async post(tripId: string, userId: string, body: string) {
    await this.assertTripAccess(tripId, userId);
    return this.prisma.message.create({
      data: { tripId, senderId: userId, body },
      include: { sender: { select: { id: true, name: true } } }
    });
  }
}
