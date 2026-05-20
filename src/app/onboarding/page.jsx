"use client";

import { OnboardingProvider, useOnboardingContext } from "@/components/onboarding/OnboardingContext";
import { StepBoasVindas } from "@/components/onboarding/StepBoasVindas";
import { StepEscolhaProva } from "@/components/onboarding/StepEscolhaProva";
import { StepNivelamento } from "@/components/onboarding/StepNivelamento";
import { StepResultado } from "@/components/onboarding/StepResultado";
import { StepCadastro } from "@/components/onboarding/StepCadastro";

function OnboardingFlow() {
  const { state } = useOnboardingContext();

  switch (state.step) {
    case 0: return <StepBoasVindas />;
    case 1: return <StepEscolhaProva />;
    case 2: return <StepNivelamento />;
    case 3: return <StepResultado />;
    case 4: return <StepCadastro />;
    default: return <StepBoasVindas />;
  }
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}
