"use client";
import React from "react";
import type { Affordability } from "@/lib/types";

export function AffordabilityCard({ a }: { a: Affordability | null }) {
  if (!a) return null;
  const color =
    a.bucket === "≤33%"
      ? "bg-green-100 text-green-700"
      : a.bucket === "34–40%"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div className={`rounded p-4 h-full ${color}`}>
      <div className="text-sm">Affordability Rate</div>
      <div className="text-2xl font-bold">
        {(Number(a.percent ?? 0)).toFixed(2)}%
      </div>
      {/* <div className="text-sm mt-1">Bucket: {a.bucket}</div> */}
    </div>
  );
}
