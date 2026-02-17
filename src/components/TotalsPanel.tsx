"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Totals } from "@/lib/types";

// formatter: 2 decimals + commas
const fmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function TotalsPanel({
  totals,
  currencySymbol = "$",
}: {
  totals: Totals | null;
  currencySymbol?: string;
}) {
  const [copied, setCopied] = useState<"income" | "rent" | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async (value: number, kind: "income" | "rent") => {
    const text = `${currencySymbol}${fmt.format(value || 0)}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard errors (e.g., insecure context)
    }
    setCopied(kind);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-white via-white to-amber-50/60 p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-30px_rgba(0,0,0,0.35)] dark:border-white/10 dark:from-neutral-900/70 dark:via-neutral-900/70 dark:to-neutral-950/60">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Totals</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">Annualized</div>
      </div>

      {!totals ? (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Add rent and income to see annual totals.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-black/10 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Annual Income</div>
                <span
                  className={`text-[10px] font-medium text-emerald-600 transition-opacity dark:text-emerald-300 ${
                    copied === "income" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Copied
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(totals.annual_income || 0, "income")}
                aria-label="Copy annual income"
                title="Copy annual income"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-600 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <rect x="4" y="4" width="11" height="11" rx="2" />
                </svg>
              </button>
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {currencySymbol}
              {fmt.format(totals.annual_income || 0)}
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Annual Rent</div>
                <span
                  className={`text-[10px] font-medium text-emerald-600 transition-opacity dark:text-emerald-300 ${
                    copied === "rent" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Copied
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(totals.annual_rent || 0, "rent")}
                aria-label="Copy annual rent"
                title="Copy annual rent"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-600 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <rect x="4" y="4" width="11" height="11" rx="2" />
                </svg>
              </button>
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {currencySymbol}
              {fmt.format(totals.annual_rent || 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
