"use client";

import { ThemeProvider as NTP } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NTP
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="resumo-theme"
    >
      {children}
    </NTP>
  );
}
