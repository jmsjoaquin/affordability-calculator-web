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
      className="rounded border px-3 py-1.5 text-sm
                 border-[color:var(--foreground)]/20
                 hover:bg-[color:var(--foreground)]/5"
      aria-pressed={mode === "dark"}
      title="Toggle theme"
    >
      {mode === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
