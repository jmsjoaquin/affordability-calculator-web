// import { CalculateRequest, CalculateResponse } from "./types";

// const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

// export async function postCalculate(payload: CalculateRequest): Promise<CalculateResponse> {
//   const res = await fetch(`${BASE}/calculate`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//     cache: "no-store", // dev only
//   });
//   if (!res.ok) {
//     const msg = await res.text().catch(() => "");
//     throw new Error(`API ${res.status}: ${msg || res.statusText}`);
//   }
//   return res.json();
// }

// src/lib/api.ts
import type { CalculateRequest, CalculateResponse } from "@/lib/types";
import { calculate } from "@/lib/calc";

// Drop-in replacement: no network, same function name + return type
export async function postCalculate(payload: CalculateRequest): Promise<CalculateResponse> {
  return calculate(payload);
}
