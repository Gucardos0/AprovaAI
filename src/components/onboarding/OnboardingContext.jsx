"use client";

import { createContext, useContext } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const value = useOnboarding();
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboardingContext must be inside OnboardingProvider");
  return ctx;
}
