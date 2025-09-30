"use client";
import React, { useRef } from "react";
import type { Frequency } from "@/lib/types";

const nf = new Intl.NumberFormat("en-US");

function formatWithCommas(raw: string): { formatted: string; numeric: number } {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (cleaned === "") return { formatted: "", numeric: 0 };

  const parts = cleaned.split(".");
  const intPart = parts[0] ?? "";
  const decPart = parts[1] ?? undefined;

  const intFormatted = intPart ? nf.format(Number(intPart)) : "0";
  const limitedDec = decPart !== undefined ? decPart.slice(0, 2) : undefined;

  const formatted = limitedDec !== undefined ? `${intFormatted}.${limitedDec}` : intFormatted;
  const numeric = Number(intPart + (limitedDec !== undefined ? `.${limitedDec}` : ""));

  return { formatted, numeric };
}

export function RentInput({
  value,
  onChange,
}: {
  value: { amount: number; frequency: Frequency; annual: number };
  onChange: (v: { amount: number; frequency: Frequency; annual: number }) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const annual = Number.isFinite(value.annual) ? value.annual : value.amount * 52;

  const handleAmountChange = (raw: string) => {
    const { formatted, numeric } = formatWithCommas(raw);

    // update state with clean numeric
    onChange({
      ...value,
      amount: numeric,
      annual: numeric * 52,
    });

    // keep formatted display value
    if (inputRef.current) {
      inputRef.current.value = formatted;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Rent</label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="border rounded px-3 py-2 w-40"
          defaultValue={value.amount ? nf.format(value.amount) : ""}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder=""
        />
      </div>
      <p className="text-sm text-gray-500">
        Annual Rent (×52): <strong>${nf.format(annual)}</strong>
      </p>
    </div>
  );
}
    