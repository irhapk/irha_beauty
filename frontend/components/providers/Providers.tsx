"use client";

import { AuthProvider } from "./AuthProvider";
import { StoreProvider } from "./StoreProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      <AuthProvider>{children}</AuthProvider>
    </StoreProvider>
  );
}
