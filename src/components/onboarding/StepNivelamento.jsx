"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useOnboardingContext } from "./OnboardingContext";
import { QUESTOES_NIVELAMENTO } from "@/lib/questoes-nivelamento";
import { cn } from "@/lib/utils";

export function StepNivelamento() {
  const { finalizarDiagnostico, prevStep } = useOnboardingContext();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [selectedLetra, setSelectedLetra] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const questao = QUESTOES_NIVELAMENTO[currentIdx];
  const total = QUESTOES_NIVELAMENTO.length;
  const progresso = (currentIdx / total) * 100;
  const isLast = currentIdx === total - 1;

  function handleSelectOpt(letra) {
    if (showFeedback) return;
    setSelectedLetra(letra);
    setShowFeedback(true);
  }

  function handleNext() {
    if (!selectedLetra) return;
    const novaResposta = {
      questaoId: questao.id,
      alternativaEscolhida: selectedLetra,
      correta: selectedLetra === questao.gabarito,
    };
    const novasRespostas = [...respostas, novaResposta];

    if (isLast) {
      finalizarDiagnostico(novasRespostas);
    } else {
      setRespostas(novasRespostas);
      setCurrentIdx((i) => i + 1);
      setSelectedLetra(null);
      setShowFeedback(false);
    }
  }

  const isCorreto = selectedLetra === questao.gabarito;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white">
      <div className="w-full max-w-2xl animate-fade-up">
        <Logo className="justify-center mb-2" />

        <div className="flex justify-between text-xs text-gray-400 mb-2 font-sora">
          <span>Questão {currentIdx + 1} de {total}</span>
          <span>Diagnóstico — {questao.materia}</span>
        </div>
        <ProgressBar value={progresso} color="gradient" className="mb-8" />

        <Badge
          variant={
            questao.materia === "Matemática" || questao.materia === "Física"
              ? "blue"
              : questao.materia === "Português"
              ? "green"
              : questao.materia === "História" || questao.materia === "Geografia"
              ? "amber"
              : "gray"
          }
          className="mb-4"
        >
          {questao.materia}
        </Badge>

        <p className="font-sora font-semibold text-xl text-gray-900 leading-snug mb-6">
          {questao.enunciado}
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {questao.alternativas.map((alt) => {
            const isSelected = selectedLetra === alt.letra;
            const isGabarito = alt.letra === questao.gabarito;
            const showCorrect = showFeedback && isGabarito;
            const showWrong = showFeedback && isSelected && !isGabarito;

            return (
              <button
                key={alt.letra}
                onClick={() => handleSelectOpt(alt.letra)}
                disabled={showFeedback}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none",
                  !showFeedback && "hover:border-brand-300 hover:bg-brand-50/30",
                  showCorrect && "border-success-400 bg-success-50",
                  showWrong && "border-danger-400 bg-danger-50",
                  isSelected && !showFeedback && "border-brand-500 bg-brand-50",
                  !isSelected && !showCorrect && !showWrong && "border-gray-100 bg-white"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sora flex-shrink-0 transition-colors",
                    showCorrect && "bg-success-400 text-white",
                    showWrong && "bg-danger-400 text-white",
                    isSelected && !showFeedback && "bg-brand-500 text-white",
                    !isSelected && !showCorrect && !showWrong && "bg-gray-100 text-gray-500"
                  )}
                >
                  {alt.letra}
                </span>
                <span className="text-gray-800 text-sm">{alt.texto}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback after answering */}
        {showFeedback && (
          <div
            className={cn(
              "p-4 rounded-xl mb-6 border",
              isCorreto
                ? "bg-success-50 border-success-400/30"
                : "bg-danger-50 border-danger-400/30"
            )}
          >
            <p className={cn("font-sora font-semibold text-sm mb-1", isCorreto ? "text-success-600" : "text-danger-600")}>
              {isCorreto ? "✓ Resposta correta!" : `✗ Resposta incorreta — gabarito: ${questao.gabarito}`}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{questao.explicacao}</p>
          </div>
        )}

        <div className="flex gap-3">
          {currentIdx === 0 && (
            <Button variant="secondary" onClick={prevStep} className="w-28">
              ← Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!selectedLetra}
            className="flex-1"
          >
            {isLast ? "Ver meu diagnóstico →" : "Próxima questão →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
