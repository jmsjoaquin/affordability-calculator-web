import type { Frequency } from "@/lib/types";

export const WEEKS_PER_YEAR = 52;
export const FORTNIGHTS_PER_YEAR = 26;
export const MONTHS_PER_YEAR = 12;

export const FREQUENCIES: Frequency[] = [
  "weekly",
  "fortnightly",
  "monthly",
  "annual",
];

export function toAnnual(amount: number, frequency: Frequency): number {
  if (!Number.isFinite(amount)) return 0;

  if (frequency === "weekly") return amount * WEEKS_PER_YEAR;
  if (frequency === "fortnightly") return amount * FORTNIGHTS_PER_YEAR;
  if (frequency === "monthly") return amount * MONTHS_PER_YEAR;
  return amount;
}

export function toWeekly(amount: number, frequency: Frequency): number {
  return toAnnual(amount, frequency) / WEEKS_PER_YEAR;
}

export function getFrequencyLabel(frequency: Frequency): string {
  if (frequency === "weekly") return "Weekly";
  if (frequency === "fortnightly") return "Fortnightly";
  if (frequency === "monthly") return "Monthly";
  return "Annual";
}
