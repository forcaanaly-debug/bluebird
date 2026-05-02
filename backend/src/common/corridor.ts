import { BadRequestException } from "@nestjs/common";

export const PILOT_PAIRS: [string, string][] = [
  ["Islamabad", "Gilgit"],
  ["Gilgit", "Islamabad"]
];

export function assertPilotCorridor(departureCity: string, arrivalCity: string, enabled: boolean): void {
  if (!enabled) return;
  const ok = PILOT_PAIRS.some(([a, b]) => a === departureCity && b === arrivalCity);
  if (!ok) {
    throw new BadRequestException(
      `Pilot corridor only allows: ${PILOT_PAIRS.map(([a, b]) => `${a}→${b}`).join(", ")}`
    );
  }
}
