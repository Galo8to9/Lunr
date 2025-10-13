// app/providers.tsx
"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // toggles 'dark' class on <html>
      defaultTheme="dark" // start in dark mode
      enableSystem={false} // ignore OS theme; set true to respect it
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
