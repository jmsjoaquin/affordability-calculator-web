export type Frequency = "weekly" | "fortnightly" | "annual";

export interface Amount {
  amount: number;
  frequency: Frequency;
}

export interface IncomeItem extends Amount {
  source?: string | null;
}

export interface CalculateRequest {
  rent: Amount;
  tenants: IncomeItem[];
  other_incomes?: IncomeItem[]; // optional if desired
}

export interface Totals {
  annual_income: number;
  weekly_income: number;
  annual_rent: number;
  weekly_rent: number;
}

export interface Affordability {
  rate: number;     // 0–1
  percent: number;  // 0–100
  bucket: "≤33%" | "34–40%" | ">40%";
}

export interface CalculateResponse {
  totals: Totals;
  affordability: Affordability;
  echo?: CalculateRequest;
}
