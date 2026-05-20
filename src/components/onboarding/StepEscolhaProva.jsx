"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useOnboardingContext } from "./OnboardingContext";
import { cn } from "@/lib/utils";

const PROVAS = [
  {
    id: "ENEM",
    icon: "📝",
    nome: "ENEM",
    desc: "Exame Nacional do Ensino Médio",
    detalhe: "Acesso a universidades federais e PROUNI",
  },
  {
    id: "FUVEST",
    icon: "🎓",
    nome: "FUVEST",
    desc: "Fundação Universitária",
    detalhe: "Principal vestibular para a USP",
  },
  {
    id: "ETEC",
    icon: "🏫",
    nome: "Vestibulinho ETEC",
    desc: "Ensino Técnico Estadual",
    detalhe: "Cursos técnicos gratuitos em SP",
  },
  {
    id: "OUTROS",
    icon: "➕",
    nome: "Outros",
    desc: "UNICAMP, UNESP, Mackenzie…",
    detalhe: "Mais de 50 vestibulares suportados",
  },
];

export function StepEscolhaProva() {
  const { setProva, nextStep, prevStep, state } = useOnboardingContext();
  const [selected, setSelected] = useState(state.prova);

  function handleContinue() {
    if (!selected) return;
    setProva(selected);
    nextStep();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl animate-fade-up">
        <Logo className="justify-center mb-2" />
        <p className="text-center text-xs text-gray-400 mb-8 font-sora">Passo 1 de 3</p>

        <h2 className="font-sora font-bold text-3xl text-gray-900 text-center mb-2">
          Para qual prova você está se preparando?
        </h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          Seu conteúdo e questões serão adaptados automaticamente.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {PROVAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "p-5 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none",
                selected === p.id
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-brand-200 hover:bg-brand-50/30"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors",
                  selected === p.id ? "bg-brand-500" : "bg-gray-100"
                )}
              >
                {p.icon}
              </div>
              <div className="font-sora font-bold text-gray-900 mb-0.5">{p.nome}</div>
              <div className="text-xs text-gray-400">{p.desc}</div>
              <div className="text-xs text-gray-500 mt-1">{p.detalhe}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={prevStep} className="w-28">
            ← Voltar
          </Button>
          <Button onClick={handleContinue} disabled={!selected} className="flex-1">
            Continuar com {selected ?? "..."} →
          </Button>
        </div>
      </div>
    </div>
  );
}
