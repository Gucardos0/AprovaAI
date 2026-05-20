"use client";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useOnboardingContext } from "./OnboardingContext";

export function StepResultado() {
  const { state, nextStep } = useOnboardingContext();
  const d = state.diagnostico;

  if (!d) return null;

  const pct = Math.round((d.pontuacao / 1000) * 100);

  const nivelCor = {
    Iniciante: "text-danger-400",
    Básico: "text-amber-600",
    Intermediário: "text-brand-500",
    Avançado: "text-success-400",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-success-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center animate-fade-up">
        <Logo className="justify-center mb-2" />
        <span className="inline-block bg-success-50 text-success-400 text-xs font-semibold font-sora uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
          Diagnóstico Concluído
        </span>

        <h2 className="font-sora font-bold text-3xl text-gray-900 mb-8">
          Seu resultado está pronto!
        </h2>

        {/* Score ring */}
        <div className="flex justify-center mb-6">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(#1A6BCC 0% ${pct}%, #e5e7eb ${pct}% 100%)`,
            }}
          >
            <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
              <span className="font-sora font-bold text-3xl text-brand-500">{d.pontuacao}</span>
              <span className="text-[10px] text-gray-400">pts estimados</span>
            </div>
          </div>
        </div>

        <p className="font-sora font-semibold text-lg mb-1">
          Nível:{" "}
          <span className={nivelCor[d.nivel] ?? "text-gray-800"}>{d.nivel}</span>
        </p>
        <p className="text-gray-400 text-sm mb-8">
          {d.nivel === "Iniciante" && "Você está começando — a plataforma vai te levar longe!"}
          {d.nivel === "Básico" && "Bons fundamentos! Vamos consolidar o conhecimento."}
          {d.nivel === "Intermediário" && "Você está no caminho certo! Vamos acelerar."}
          {d.nivel === "Avançado" && "Impressionante! Vamos afinar os detalhes."}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-success-50 rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold text-success-400 font-sora uppercase tracking-wider mb-3">
              ✓ Pontos fortes
            </p>
            {d.pontosFortes.map((m) => (
              <span
                key={m}
                className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mr-1.5 mb-1.5"
              >
                {m}
              </span>
            ))}
          </div>
          <div className="bg-danger-50 rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold text-danger-400 font-sora uppercase tracking-wider mb-3">
              ↑ Focar em
            </p>
            {d.pontosFracos.map((m) => (
              <span
                key={m}
                className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full mr-1.5 mb-1.5"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-brand-50 rounded-2xl p-4 mb-8 text-brand-600 text-sm font-medium">
          ✨ Ótimo começo! Seu plano personalizado já está pronto — falta só criar sua conta.
        </div>

        <Button size="lg" onClick={nextStep} className="w-full justify-center">
          Ver meu plano personalizado →
        </Button>
      </div>
    </div>
  );
}
