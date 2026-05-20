"use client";

import { useState, useCallback } from "react";
import { calcularDiagnostico } from "@/lib/utils";
import { MATERIA_POR_QUESTAO } from "@/lib/questoes-nivelamento";

const INITIAL_STATE = {
  step: 0,
  prova: null,
  respostas: [],
  diagnostico: null,
};

export function useOnboarding() {
  const [state, setState] = useState(INITIAL_STATE);

  const setProva = useCallback((prova) => {
    setState((s) => ({ ...s, prova }));
  }, []);

  const nextStep = useCallback(() => {
    setState((s) => ({ ...s, step: s.step + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }));
  }, []);

  const addResposta = useCallback((resposta) => {
    setState((s) => {
      const respostas = [...s.respostas.filter((r) => r.questaoId !== resposta.questaoId), resposta];
      return { ...s, respostas };
    });
  }, []);

  const finalizarDiagnostico = useCallback((respostas) => {
    const materia = MATERIA_POR_QUESTAO;
    const diagnostico = calcularDiagnostico(respostas, materia);
    setState((s) => ({ ...s, diagnostico, respostas, step: s.step + 1 }));
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { state, setProva, nextStep, prevStep, addResposta, finalizarDiagnostico, reset };
}
