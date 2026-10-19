"use client";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useOnboardingContext } from "./OnboardingContext";

export function StepBoasVindas() {
  const { nextStep } = useOnboardingContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden bg-white">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-success-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center animate-fade-up">
        <Logo size="lg" className="justify-center mb-8" />

        <span className="inline-block bg-brand-50 text-brand-500 text-xs font-semibold font-sora uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
          Inteligência Artificial Educacional
        </span>

        <h1 className="font-sora font-bold text-4xl text-gray-900 leading-tight mb-4">
          Sua aprovação começa com{" "}
          <span className="text-brand-500">um diagnóstico</span>
        </h1>

        <p className="text-gray-500 text-lg leading-relaxed mb-10">
          A plataforma que usa IA para criar seu plano de estudos personalizado
          para ENEM, FUVEST, ETEC e muito mais.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button size="lg" onClick={nextStep}>
            Começar diagnóstico gratuito →
          </Button>
          <Button size="lg" variant="secondary" onClick={() => window.location.href = "/dashboard"}>
            Ver demo
          </Button>
          <Button size ="lg" variant="secondary" onClick={() =>window.location.href = "/login"} >
            Login
          </Button>
        </div>

        {/* Social proof */}
        <div className="flex gap-8 justify-center">
          {[
            { value: "+12k", label: "Alunos aprovados" },
            { value: "94%", label: "Taxa de aprovação" },
            { value: "IA", label: "100% adaptativa" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-sora font-bold text-2xl text-brand-500">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
