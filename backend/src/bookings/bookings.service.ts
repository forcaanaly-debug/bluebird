import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { BookingStatus, TripStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(riderId: string, tripId: string, seats: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { driverProfile: true }
    });
    if (!trip || trip.status !== TripStatus.PUBLISHED) throw new NotFoundException("Trip not available");
    if (trip.driverProfile.userId === riderId) throw new BadRequestException("Cannot book own trip");
    if (trip.seatsAvailable < seats) throw new BadRequestException("Not enough seats");

    return this.prisma.booking.create({
      data: { tripId, riderId, seats, status: BookingStatus.REQUESTED }
    });
  }

  async listAsRider(riderId: string) {
    return this.prisma.booking.findMany({
      where: { riderId },
      orderBy: { createdAt: "desc" },
      include: { trip: true }
    });
  }

  async listDriverRequests(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.REQUESTED,
        trip: { driverProfileId: profile.id }
      },
      orderBy: { createdAt: "desc" },
      include: { trip: true, rider: { select: { id: true, name: true, phone: true } } }
    });
  }

  async accept(bookingId: string, driverUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.driverProfile.findUnique({ where: { userId: driverUserId } });
      if (!profile) throw new ForbiddenException();

      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { trip: true }
      });
      if (!booking) throw new NotFoundException();
      if (booking.trip.driverProfileId !== profile.id) throw new ForbiddenException();
      if (booking.status !== BookingStatus.REQUESTED) throw new BadRequestException("Not in requested state");

      const trip = await tx.trip.findUnique({ where: { id: booking.tripId } });
      if (!trip || trip.status !== TripStatus.PUBLISHED) throw new BadRequestException("Trip not active");
      if (trip.seatsAvailable < booking.seats) throw new ConflictException("Seats no longer available");

      await tx.trip.update({
        where: { id: trip.id },
        data: { seatsAvailable: { decrement: booking.seats } }
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED }
      });
    });
  }

  async submitPaymentProof(
    riderId: string,
    bookingId: string,
    data: { method: string; reference?: string; proofUrl?: string }
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException();
    if (booking.riderId !== riderId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException("Payment proof only after confirmation");
    }
    return this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method: data.method,
        reference: data.reference ?? null,
        proofUrl: data.proofUrl ?? null,
        status: "pending"
      },
      update: {
        method: data.method,
        reference: data.reference ?? undefined,
        proofUrl: data.proofUrl ?? undefined
      }
    });
  }

  async reject(bookingId: string, driverUserId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
    if (!profile) throw new ForbiddenException();
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true }
    });
    if (!booking) throw new NotFoundException();
    if (booking.trip.driverProfileId !== profile.id) throw new ForbiddenException();
    if (booking.status !== BookingStatus.REQUESTED) throw new BadRequestException();
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REJECTED }
    });
  }

  async cancelByRider(bookingId: string, riderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { trip: true }
      });
      if (!booking) throw new NotFoundException();
      if (booking.riderId !== riderId) throw new ForbiddenException();
      if (booking.status === BookingStatus.CANCELLED) return booking;
      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException("Completed booking cannot be cancelled");
      }

      const shouldRestoreSeats = booking.status === BookingStatus.CONFIRMED;
      if (shouldRestoreSeats && booking.trip.status === TripStatus.PUBLISHED) {
        await tx.trip.update({
          where: { id: booking.tripId },
          data: { seatsAvailable: { increment: booking.seats } }
        });
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED }
      });
    });
  }
}
