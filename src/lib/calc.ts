// src/lib/calc.ts
import type {
  CalculateRequest,
  CalculateResponse,
  Frequency,
  Totals,
  Affordability,
} from "@/lib/types";

const WEEKS_PER_YEAR = 52;
const FORTNIGHTS_PER_YEAR = 26;

function toAnnual(amount: number, freq: Frequency): number {
  if (!Number.isFinite(amount)) return 0;
  if (freq === "weekly") return amount * WEEKS_PER_YEAR;
  if (freq === "fortnightly") return amount * FORTNIGHTS_PER_YEAR;
  return amount; // already annual
}

function sumAnnual(items: { amount: number; frequency: Frequency }[]): number {
  return items.reduce((acc, it) => acc + toAnnual(it.amount, it.frequency), 0);
}

function bucketize(ratePercent: number): Affordability["bucket"] {
  if (ratePercent <= 33) return "≤33%";
  if (ratePercent <= 40) return "34–40%";
  return ">40%";
}

export function calculate(req: CalculateRequest): CalculateResponse {
  // --- Rent ---
  const annual_rent = toAnnual(req.rent.amount, req.rent.frequency);
  const weekly_rent = annual_rent / WEEKS_PER_YEAR;

  // --- Incomes ---
  const annual_tenants = sumAnnual(req.tenants);
  const annual_others = req.other_incomes ? sumAnnual(req.other_incomes) : 0;
  const annual_income = annual_tenants + annual_others;
  const weekly_income = annual_income / WEEKS_PER_YEAR;

  // --- Affordability ---
  const rate = annual_income > 0 ? annual_rent / annual_income : 0;
  const percent = rate * 100;
  const bucket = bucketize(percent);

  const totals: Totals = {
    annual_income,
    weekly_income,
    annual_rent,
    weekly_rent,
  };

  const affordability: Affordability = {
    rate,
    percent,
    bucket,
  };

  return {
    totals,
    affordability,
    echo: req, // optional echo back the request, useful for debugging
  };
}
