"use client";
import React, { useEffect, useRef, useState } from "react";
import { toAnnual } from "@/lib/frequency";

const nf = new Intl.NumberFormat("en-US");

function formatWithCommas(raw: string): { formatted: string; numeric: number | "" } {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (cleaned === "") return { formatted: "", numeric: "" };

  const [intPart = "", decPart] = cleaned.split(".");
  const ints = intPart ? String(Number(intPart)) : "0";
  const dec = decPart !== undefined ? decPart.slice(0, 2) : undefined;

  const formatted = dec !== undefined ? `${nf.format(Number(ints))}.${dec}` : nf.format(Number(ints));
  const numeric = Number(`${ints}${dec !== undefined ? "." + dec : ""}`);
  return { formatted, numeric: Number.isFinite(numeric) ? numeric : "" };
}

// keep caret stable after reformatting
function placeCaretFromDigitCount(
  input: HTMLInputElement,
  formatted: string,
  digitsBefore: number,
  wasAfterDot: boolean,
  decimalsBefore: number
) {
  if (wasAfterDot) {
    const dotIdx = formatted.indexOf(".");
    if (dotIdx >= 0) {
      const target = Math.min(dotIdx + 1 + decimalsBefore, formatted.length);
      input.setSelectionRange(target, target);
      return;
    }
  }
  let seen = 0,
    pos = 0;
  while (pos < formatted.length && seen < digitsBefore) {
    if (/\d/.test(formatted[pos])) seen++;
    pos++;
  }
  input.setSelectionRange(pos, pos);
}

export function RentInput({
  value,
  onChange,
  currencySymbol = "$",
}: {
  value: { amount: number; frequency: "monthly"; annual: number };
  onChange: (v: { amount: number; frequency: "monthly"; annual: number }) => void;
  currencySymbol?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // local draft keeps the exact typed text (e.g., "5,555." or ".45")
  const [draft, setDraft] = useState<string>(() =>
    value.amount ? nf.format(value.amount) : ""
  );

  // sync draft when parent changes (e.g., form reset)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(value.amount ? nf.format(value.amount) : "");
    }
  }, [value.amount]);

  const annual = Number.isFinite(value.annual)
    ? value.annual
    : toAnnual(value.amount, value.frequency);

  const handleAmountChange = (raw: string) => {
    const el = inputRef.current!;
    const caret = el.selectionStart ?? raw.length;
    const before = raw.slice(0, caret);
    const digitsBefore = before.replace(/[^0-9]/g, "").length;
    const wasAfterDot = before.includes(".");
    const decimalsBefore = wasAfterDot ? (before.split(".")[1] || "").replace(/\D/g, "").length : 0;

    const { formatted, numeric } = formatWithCommas(raw);
    setDraft(formatted);

    // send numeric value to parent
    const amount = numeric === "" ? 0 : Number(numeric);
    onChange({
      ...value,
      amount,
      annual: toAnnual(amount, value.frequency),
    });

    // restore caret after re-render
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      placeCaretFromDigitCount(node, formatted, digitsBefore, wasAfterDot, decimalsBefore);
    });
  };

  const handleBlur = () => {
    // commit (including clear)
    if (!draft) {
      setDraft("");
      onChange({ ...value, amount: 0, annual: 0 });
      return;
    }

    const { numeric } = formatWithCommas(draft);
    if (numeric === "") {
      setDraft("");
      onChange({ ...value, amount: 0, annual: 0 });
      return;
    }

    const rounded = Math.round(Number(numeric) * 100) / 100;
    setDraft(nf.format(rounded));
    onChange({ ...value, amount: rounded, annual: toAnnual(rounded, value.frequency) });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Monthly rent
      </label>
      <div className="relative w-full max-w-[220px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400">
          {currencySymbol}
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 pl-7 text-right font-mono tabular-nums text-neutral-900 placeholder:text-neutral-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:ring-amber-400/40"
          value={draft}
          onChange={(e) => handleAmountChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => {
            if (!draft && value.amount) setDraft(nf.format(value.amount));
          }}
          placeholder="0.00"
          aria-label="Monthly rent"
        />
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Annual rent:{" "}
        <strong className="text-neutral-900 dark:text-neutral-100">
          {currencySymbol}
          {nf.format(annual || 0)}
        </strong>
      </p>
    </div>
  );
}
