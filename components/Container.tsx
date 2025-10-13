// components/Container.tsx
import React from "react";

export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-6">{children}</div>;
}
