import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TripStatus, VerificationStatus } from "@prisma/client";
import { assertPilotCorridor, PILOT_PAIRS } from "../common/corridor";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  private corridorStrict(): boolean {
    return this.config.get<string>("CORRIDOR_ISB_GILGIT_ONLY") === "true";
  }

  async create(
    userId: string,
    data: {
      departureCity: string;
      arrivalCity: string;
      departureDate: string;
      departureTime: string;
      seatsAvailable: number;
      farePerSeat: number;
      vehicleType: string;
      notes?: string;
    }
  ) {
    assertPilotCorridor(data.departureCity, data.arrivalCity, this.corridorStrict());

    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException("Complete driver registration first");
    if (profile.verificationStatus !== VerificationStatus.APPROVED) {
      throw new ForbiddenException("Driver not verified yet");
    }

    const departureDate = new Date(`${data.departureDate}T00:00:00.000Z`);

    return this.prisma.trip.create({
      data: {
        driverProfileId: profile.id,
        departureCity: data.departureCity,
        arrivalCity: data.arrivalCity,
        departureDate,
        departureTime: data.departureTime,
        seatsAvailable: data.seatsAvailable,
        farePerSeat: data.farePerSeat,
        vehicleType: data.vehicleType,
        notes: data.notes ?? null,
        status: TripStatus.PUBLISHED
      }
    });
  }

  async search(from?: string, to?: string, date?: string) {
    const where: Record<string, unknown> = { status: TripStatus.PUBLISHED };
    if (from) where.departureCity = from;
    if (to) where.arrivalCity = to;
    if (date) {
      const d = new Date(`${date}T00:00:00.000Z`);
      where.departureDate = d;
    }
    const rows = await this.prisma.trip.findMany({
      where,
      orderBy: { departureDate: "asc" },
      include: {
        driverProfile: { include: { user: { select: { id: true, name: true, phone: true } } } }
      }
    });
    if (this.corridorStrict()) {
      return rows.filter((t) =>
        PILOT_PAIRS.some(([a, b]) => a === t.departureCity && b === t.arrivalCity)
      );
    }
    return rows;
  }

  async listMine(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.trip.findMany({
      where: { driverProfileId: profile.id },
      orderBy: { departureDate: "desc" },
      include: { bookings: true }
    });
  }

  async cancel(tripId: string, userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException();
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, driverProfileId: profile.id }
    });
    if (!trip) throw new NotFoundException();
    return this.prisma.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED }
    });
  }
}
