"use client";
import React from "react";
import type { Totals } from "@/lib/types";

// formatter: 2 decimals + commas
const fmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function TotalsPanel({ totals }: { totals: Totals | null }) {
  if (!totals) return null;

  return (
    <div className="border rounded p-4 grid grid-cols-2 gap-3 h-full">
      <div>
        <div className="text-xs text-gray-500">Annual Income</div>
        <div className="font-semibold">
          ${fmt.format(totals.annual_income || 0)}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">Annual Rent</div>
        <div className="font-semibold">
          ${fmt.format(totals.annual_rent || 0)}
        </div>
      </div>
    </div>
  );
}
