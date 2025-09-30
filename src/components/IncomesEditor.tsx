"use client";
import React, { useEffect, useMemo, useRef } from "react";
import type { IncomeItem, Frequency } from "@/lib/types";

const FREQS: Frequency[] = ["weekly", "fortnightly", "annual"];
type UIIncomeItem = Omit<IncomeItem, "amount"> & { amount: number | "" };

const makeBlank = (last?: Frequency): UIIncomeItem => ({
  source: "",
  amount: "",
  frequency: (last ?? "weekly") as Frequency,
});

// ---------- number formatting ----------
const nf = new Intl.NumberFormat("en-US");

function formatWithCommas(raw: string): { formatted: string; numeric: number | "" } {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return { formatted: "", numeric: "" };
  const [intPart = "", decPart] = cleaned.split(".");
  const intFmt = intPart ? nf.format(Number(intPart)) : "0";
  const dec = decPart !== undefined ? decPart.slice(0, 2) : undefined;
  const formatted = dec !== undefined ? `${intFmt}.${dec}` : intFmt;
  const numeric =
    intPart === "" && dec === undefined ? "" : Number(intPart + (dec !== undefined ? `.${dec}` : ""));
  return { formatted, numeric };
}

// keep caret stable after formatting
function placeCaretFromDigitCount(
  input: HTMLInputElement,
  formatted: string,
  digitsBefore: number,
  wasAfterDot: boolean
) {
  if (wasAfterDot) {
    const dotIdx = formatted.indexOf(".");
    if (dotIdx >= 0) {
      input.setSelectionRange(dotIdx + 1, dotIdx + 1);
      return;
    }
  }
  let seen = 0;
  let pos = 0;
  while (pos < formatted.length && seen < digitsBefore) {
    if (/\d/.test(formatted[pos])) seen++;
    pos++;
  }
  input.setSelectionRange(pos, pos);
}

export function IncomesEditor({
  label,
  items,
  onChange,
  minRows = 3,
  rowPrefix = "Tenant",
  placeholder = "Net Salary",   // 👈 new default
}: {
  label: string;
  items: UIIncomeItem[];
  onChange: React.Dispatch<React.SetStateAction<UIIncomeItem[]>>;
  minRows?: number;
  rowPrefix?: string;
  placeholder?: string;
}) {

  // refs for amount and freq group per row
  const rowRefs = useRef<{ amount: HTMLInputElement | null; freq: HTMLDivElement | null }[]>([]);

  // ensure scaffold rows
  useEffect(() => {
    if (items.length < minRows) {
      const last = items.at(-1)?.frequency ?? "weekly";
      const pad = Array.from({ length: minRows - items.length }, () => makeBlank(last));
      onChange([...items, ...pad]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, minRows]);

  const update = (i: number, patch: Partial<UIIncomeItem>) => {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const addRow = (freqHint?: Frequency) => onChange([...items, makeBlank(freqHint ?? items.at(-1)?.frequency)]);
  const clearRow = (i: number) => update(i, makeBlank(items[i]?.frequency));
  const removeRow = (i: number) => {
    if (items.length <= minRows) return clearRow(i);
    onChange(items.filter((_, idx) => idx !== i));
  };

  const setAllFrequency = (f: Frequency) => onChange(items.map((r) => ({ ...r, frequency: f })));

  // bulk paste: lines of "amount[, freq]"
  const handleBulkPaste = (startIndex: number, text: string) => {
    const rows = text
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (rows.length <= 1) return false; // not a bulk paste

    const parsed: UIIncomeItem[] = rows.map((l, idx) => {
      const [amtRaw, freqRaw] = l.split(",").map((x) => x?.trim());
      const amt = Number((amtRaw || "").replace(/[^\d.]/g, ""));
      const freqStr = (freqRaw || "").toLowerCase();
      const freq = (FREQS.includes(freqStr as Frequency) ? (freqStr as Frequency) : items[startIndex + idx]?.frequency) ??
        items.at(-1)?.frequency ??
        "weekly";
      return { ...makeBlank(freq), amount: isFinite(amt) && amt > 0 ? amt : "" };
    });

    const next = items.slice();
    // ensure capacity
    while (startIndex + parsed.length > next.length) next.push(makeBlank(next.at(-1)?.frequency));
    for (let j = 0; j < parsed.length; j++) next[startIndex + j] = { ...next[startIndex + j], ...parsed[j] };
    onChange(next);

    // focus last pasted row's amount
    requestAnimationFrame(() => {
      const idx = startIndex + parsed.length - 1;
      rowRefs.current[idx]?.amount?.focus();
    });
    return true;
  };

  // live totals (optional, small hint under toolbar)
  const summary = useMemo(() => {
    let weekly = 0;
    for (const it of items) {
      if (typeof it.amount !== "number") continue;
      if (it.frequency === "weekly") weekly += it.amount;
      else if (it.frequency === "fortnightly") weekly += it.amount / 2;
      else weekly += it.amount / 52;
    }
    const annual = weekly * 52;
    return { weekly, annual };
  }, [items]);

  return (
    <div className="space-y-3">
      {/* Header + quick actions */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-3 text-sm">
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-xs text-gray-400">Set all:</span>
            <button className="underline" type="button" onClick={() => setAllFrequency("weekly")}>
              Weekly
            </button>
            <button className="underline" type="button" onClick={() => setAllFrequency("fortnightly")}>
              Fortnightly
            </button>
            <button className="underline" type="button" onClick={() => setAllFrequency("annual")}>
              Annual
            </button>
          </div>
          <button className="underline" type="button" onClick={() => addRow()}>
            + Add
          </button>
        </div>
      </div>

      {/* Tiny live summary */}
      <div className="text-xs text-gray-400">
        ≈ Weekly total: <span className="tabular-nums font-mono">{nf.format(Math.round(summary.weekly * 100) / 100)}</span>{" "}
        • Annual total: <span className="tabular-nums font-mono">{nf.format(Math.round(summary.annual))}</span>
      </div>

      <div className="space-y-2">
        {items.map((it, i) => {
          const isAnnual = it.frequency === "annual";
          const isWeekly = it.frequency === "weekly";
          const isFortnightly = it.frequency === "fortnightly";

          // formatted display value
          const displayValue =
            it.amount === ""
              ? ""
              : nf.format(Math.trunc(Number(it.amount))) +
                (Number(it.amount) % 1 !== 0 ? `.${String(Number(it.amount).toFixed(2)).split(".")[1]}` : "");

          return (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-center text-xs text-gray-400 select-none">{rowPrefix} {i + 1}</span>

              {/* amount */}
              <input
                ref={(el) => {
                  rowRefs.current[i] ||= { amount: null, freq: null };
                  rowRefs.current[i].amount = el;
                }}
                type="text"
                inputMode="decimal"
                className="border rounded px-3 py-2 w-40 text-right font-mono tabular-nums"
                value={displayValue}
                placeholder={isAnnual ? "Annual" : placeholder}
                aria-label={`${rowPrefix} ${i + 1} ${isAnnual ? "Annual" : placeholder}`}
                aria-keyshortcuts="Enter,W,F,A"
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (text.includes("\n")) {
                    e.preventDefault();
                    handleBulkPaste(i, text);
                  }
                }}
                onChange={(e) => {
                  const el = e.currentTarget;
                  const raw = el.value;
                  const caret = el.selectionStart ?? raw.length;
                  const before = raw.slice(0, caret);
                  const digitsBefore = before.replace(/[^0-9]/g, "").length;
                  const wasAfterDot = before.includes(".");

                  const { formatted, numeric } = formatWithCommas(raw);

                  // auto-add when typing in the last row
                  if (i === items.length - 1 && numeric !== "") {
                    const next = items.slice();
                    next[i] = { ...next[i], amount: numeric };
                    onChange([...next, makeBlank(next[i].frequency)]);
                  } else {
                    update(i, { amount: numeric });
                  }

                  requestAnimationFrame(() => {
                    const node = rowRefs.current[i]?.amount;
                    if (node) placeCaretFromDigitCount(node, formatted, digitsBefore, wasAfterDot);
                    if (node && node.value !== formatted) node.value = formatted;
                  });
                }}
                onBlur={(e) => {
                  const { numeric } = formatWithCommas(e.currentTarget.value);
                  if (numeric === "") return update(i, { amount: "" });
                  const rounded = Math.round(Number(numeric) * 100) / 100;
                  update(i, { amount: rounded });
                }}
                onKeyDown={(e) => {
                  const k = e.key.toLowerCase();
                  if (k === "w") update(i, { frequency: "weekly" });
                  if (k === "f") update(i, { frequency: "fortnightly" });
                  if (k === "a") update(i, { frequency: "annual" });
                  if (k === "escape") {
                    e.preventDefault();
                    update(i, { amount: "" });
                    (e.currentTarget as HTMLInputElement).value = "";
                  }
                  if (k === "enter") {
                    e.preventDefault();
                    rowRefs.current[i]?.freq?.querySelector<HTMLButtonElement>("button[aria-pressed='true']")?.focus();
                  }
                }}
              />

              {/* frequency segmented (W/F/A) */}
              <div
                ref={(el) => {
                  rowRefs.current[i] ||= { amount: null, freq: null };
                  rowRefs.current[i].freq = el;
                }}
                className="inline-flex rounded-md border overflow-hidden"
                role="group"
                aria-label={`${rowPrefix} ${i + 1} frequency`}
              >
                {FREQS.map((opt, idx) => {
                  const active = it.frequency === opt;
                  const label = opt === "weekly" ? "Weekly" : opt === "fortnightly" ? "Fortnightly" : "Annual";
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={[
                        "px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 transition-colors",
                        active ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100",
                        idx > 0 ? "border-l" : "",
                      ].join(" ")}
                      aria-pressed={active}
                      aria-label={opt}
                      onClick={() => update(i, { frequency: opt })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          // next row focus or create one
                          if (i === items.length - 1) addRow(items[i].frequency);
                          requestAnimationFrame(() => rowRefs.current[i + 1]?.amount?.focus());
                        }
                        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          const dir = e.key === "ArrowRight" ? 1 : -1;
                          const idxNow = FREQS.indexOf(it.frequency);
                          const next = (idxNow + dir + FREQS.length) % FREQS.length;
                          update(i, { frequency: FREQS[next] });
                        }
                        const k = e.key.toLowerCase();
                        if (k === "w") update(i, { frequency: "weekly" });
                        if (k === "f") update(i, { frequency: "fortnightly" });
                        if (k === "a") update(i, { frequency: "annual" });
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* tiny computed chips */}
              <span className="text-xs text-gray-500">
                {isAnnual && typeof it.amount === "number" && `≈ ${Math.round((it.amount / 52) * 100) / 100} weekly`}
                {isWeekly && typeof it.amount === "number" && `≈ ${Math.round(it.amount * 52 * 100) / 100} annual`}
                {isFortnightly && typeof it.amount === "number" && `≈ ${Math.round(it.amount * 26 * 100) / 100} annual`}
              </span>

              {/* row actions */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => clearRow(i)}
                  aria-label={`Clear ${rowPrefix} ${i + 1}`}
                  title="Clear row (Esc inside input also clears)"
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                  onClick={() => removeRow(i)}
                  aria-label={`Remove ${rowPrefix} ${i + 1}`}
                  title="Remove row"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
