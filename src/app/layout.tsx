
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const setTheme = `
    (function() {
      try {
        const saved = localStorage.getItem("theme"); // "dark" | "light" | null
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const html = document.documentElement;

        html.classList.remove("light","dark");
        if (saved === "dark" || (!saved && prefersDark)) {
          html.classList.add("dark");
        } else if (saved === "light") {
          html.classList.add("light");
        }
      } catch (_) {}
    })();
  `;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setTheme }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}