"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    setMode(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const next = mode === "dark" ? "light" : "dark";
    html.classList.remove("light","dark");
    html.classList.add(next);
    localStorage.setItem("theme", next);
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-neutral-900/60 dark:hover:bg-neutral-900"
      aria-pressed={mode === "dark"}
      title="Toggle theme"
    >
      {mode === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
