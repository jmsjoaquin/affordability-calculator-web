"use client";
import React from "react";
import type { Affordability } from "@/lib/types";

export function AffordabilityCard({ a }: { a: Affordability | null }) {
  const percent = Number(a?.percent ?? 0);
  const clamped = Math.min(100, Math.max(0, percent));
  const tone =
    a?.bucket === "≤33%"
      ? {
          pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
          bar: "bg-emerald-500",
        }
      : a?.bucket === "34–40%"
      ? {
          pill: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
          bar: "bg-amber-500",
        }
      : {
          pill: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
          bar: "bg-rose-500",
        };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-white via-white to-amber-50/50 p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-30px_rgba(0,0,0,0.35)] dark:border-white/10 dark:from-neutral-900/70 dark:via-neutral-900/70 dark:to-neutral-950/60">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Affordability
        </div>
        {a ? (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.pill}`}>
            {a.bucket}
          </span>
        ) : (
          <span className="rounded-full border border-black/10 px-2.5 py-1 text-xs text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Awaiting inputs
          </span>
        )}
      </div>

      {!a ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Enter rent and income to see your affordability band.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-end justify-between">
            <div className="text-3xl font-semibold tabular-nums">{percent.toFixed(2)}%</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Target ≤ 33%</div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/10">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${clamped}%` }} />
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Share of rent relative to total income.
          </p>
        </>
      )}
    </div>
  );
}
