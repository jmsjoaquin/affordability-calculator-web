"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { RentInput } from "@/components/RentInput";
import { IncomesEditor } from "@/components/IncomesEditor";
import { TotalsPanel } from "@/components/TotalsPanel";
import { AffordabilityCard } from "@/components/AffordabilityCard";
import { postCalculate } from "@/lib/api";
import { toAnnual } from "@/lib/frequency";
import type {
  CalculateRequest,
  CalculateResponse,
  IncomeItem,
} from "@/lib/types";
// UI shape that matches IncomesEditor (amount can be "")
type UIIncomeItem = Omit<IncomeItem, "amount"> & { amount: number | "" };

const DEBOUNCE_MS = 350;
const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "PHP", symbol: "₱", label: "PHP (₱)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
];

export default function HomePage() {
  const [rent, setRent] = useState<{ amount: number | ""; frequency: "weekly" }>(
    { amount: "", frequency: "weekly" }
  );
  const currency = CURRENCIES[0];
  const rentForInput = useMemo(() => {
    const amt = rent.amount === "" ? 0 : Number(rent.amount);
    return {
      amount: amt,
      frequency: rent.frequency,
      annual: toAnnual(amt, rent.frequency),
    };
  }, [rent]);

  const handleRentChange = (v: {
    amount: number;
    frequency: "weekly";
    annual: number;
  }) => {
    setRent({ amount: v.amount, frequency: v.frequency });
  };
  const [tenants, setTenants] = useState<UIIncomeItem[]>([]);
  const [others, setOthers] = useState<UIIncomeItem[]>([]);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const reqCounter = useRef(0);

  const handleClearAll = () => {
    reqCounter.current += 1;
    setRent({ amount: "", frequency: "weekly" });
    setTenants([]);
    setOthers([]);
    setResult(null);
    setLoading(false);
    setErr(null);
  };

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
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-500/20" />
        <div className="absolute -bottom-40 left-[-5%] h-96 w-96 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,244,230,0.6),transparent_45%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.03),transparent_55%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
           
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-neutral-950 dark:text-neutral-100">
              Rent Affordability Calculator
            </h1>
            <p className="max-w-xl text-sm text-neutral-700 dark:text-neutral-300">
              Add rent and income streams in weekly, fortnightly, monthly, or annual amounts
              to see annual totals and your affordability band in real time.
            </p>
          </div>
          </header>

        <div className="space-y-8">
          <section className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_22px_60px_-40px_rgba(60,38,20,0.35)] backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-600/90 dark:text-amber-300/90">
                  Inputs
                </p>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Rent & income
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Auto-calculates as you type
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/50">
                  <RentInput
                    value={rentForInput}
                    onChange={handleRentChange}
                    currencySymbol={currency.symbol}
                  />
                </div>
                <TotalsPanel totals={result?.totals ?? null} currencySymbol={currency.symbol} />
                <AffordabilityCard a={result?.affordability ?? null} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/50">
                  <IncomesEditor
                    label="Applicant"
                    items={tenants}
                    onChange={setTenants}
                    rowPrefix="Applicant"
                    placeholder="Net Salary"
                    minRows={3}
                  />
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/50">
                  <IncomesEditor
                    label="Other incomes"
                    items={others}
                    onChange={setOthers}
                    rowPrefix="Other Income"
                    placeholder="Other income"
                    minRows={3}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                {loading && (
                  <div className="text-amber-700/90 dark:text-amber-300/90">
                    Calculating…
                  </div>
                )}
                {err && <div className="text-red-600 dark:text-red-400">{err}</div>}
                {!canCompute && (
                  <div className="text-neutral-500 dark:text-neutral-400">
                    Enter a rent amount to see results.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
