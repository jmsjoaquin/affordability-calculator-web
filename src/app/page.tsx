"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { RentInput } from "@/components/RentInput";
import { IncomesEditor } from "@/components/IncomesEditor";
import { TotalsPanel } from "@/components/TotalsPanel";
import { AffordabilityCard } from "@/components/AffordabilityCard";
import { postCalculate } from "@/lib/api";
import type {
  CalculateRequest,
  CalculateResponse,
  Frequency,
  IncomeItem,
} from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
// UI shape that matches IncomesEditor (amount can be "")
type UIIncomeItem = Omit<IncomeItem, "amount"> & { amount: number | "" };

const DEBOUNCE_MS = 350;

export default function HomePage() {
  const [rent, setRent] = useState<{ amount: number | ""; frequency: Frequency }>(
    { amount: "", frequency: "weekly" }
  );
  const rentForInput = useMemo(() => {
  const amt = rent.amount === "" ? 0 : Number(rent.amount);
  return {
    amount: amt,
    frequency: rent.frequency,
    annual: amt * 52, // always ×52
  };
}, [rent]);

// 3) adapter: map back from RentInput to your UI state
const handleRentChange = (v: { amount: number; frequency: Frequency; annual: number }) => {
  setRent({ amount: v.amount, frequency: v.frequency });
};
  const [tenants, setTenants] = useState<UIIncomeItem[]>([]);
  const [others, setOthers] = useState<UIIncomeItem[]>([]);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- helpers ---
  const normalize = (rows: UIIncomeItem[]): IncomeItem[] =>
    rows
      .filter((r) => r.amount !== "" && Number(r.amount) > 0)
      .map((r) => ({
        source: r.source,
        amount: Number(r.amount),
        frequency: r.frequency,
      }));

  const canCompute = useMemo(
    () => rent.amount !== "" && Number(rent.amount) > 0,
    [rent.amount]
  );

  // Build the payload whenever inputs change (memoized)
  const payload: CalculateRequest | null = useMemo(() => {
    if (!canCompute) return null;
    return {
      rent: { amount: Number(rent.amount), frequency: rent.frequency },
      tenants: normalize(tenants),
      other_incomes: normalize(others),
    };
  }, [canCompute, rent, tenants, others]);

  // Track latest request to avoid race conditions
  const reqCounter = useRef(0);

  // --- auto compute on input with debounce ---
  useEffect(() => {
    setErr(null);

    if (!payload) {
      setResult(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const thisReq = ++reqCounter.current;

    const t = setTimeout(async () => {
      try {
        const res = await postCalculate(payload);
        // only apply if this is the latest request
        if (thisReq === reqCounter.current) {
          setResult(res);
          setErr(null);
        }
      } catch (e: unknown) {
  const msg =
    e instanceof Error ? e.message : typeof e === "string" ? e : "Request failed";
  if (thisReq === reqCounter.current) {
    setResult(null);
    setErr(String(msg));
  }
      } finally {
        if (thisReq === reqCounter.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [payload]);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center justify-between">
  Affordability Calculator
  <ThemeToggle />
</h1>

      <div>
        {/* LEFT column: inputs */}
        <section >
          <RentInput value={rentForInput} onChange={handleRentChange} />

          {/* Tenants */}
          <div className="rounded max-h-[30vh] overflow-y-auto overflow-x-hidden overscroll-contain">
            <IncomesEditor
              label="Applicants"
              items={tenants}
              onChange={setTenants}
              rowPrefix="Applicants"
              placeholder="Net Salary"
              minRows={3}
            />
          </div>

          {/* Other incomes */}
          <div className="rounded max-h-[30vh] overflow-y-auto overflow-x-hidden overscroll-contain">
            <IncomesEditor
              label="Other incomes"
              items={others}
              onChange={setOthers}
              rowPrefix="Other Income"
              placeholder="Other income"
              minRows={3}
            />
          </div>

          {/* Live status */}
          {loading && <div className="text-sm text-gray-500">Calculating…</div>}
          {err && <div className="text-red-600 text-sm">{err}</div>}
          {!canCompute && (
            <div className="text-sm text-gray-500">Enter a rent amount to see results.</div>
          )}
        </section>

        {/* RIGHT column: results — always shown */}
        <div className="grid gap-4 md:grid-cols-2 p-2 ">
          <TotalsPanel totals={result?.totals ?? null} />
          <AffordabilityCard a={result?.affordability ?? null} />
        </div>
      </div>
    </main>
  );
}
