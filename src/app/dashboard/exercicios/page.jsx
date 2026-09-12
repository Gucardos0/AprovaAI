"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, getDificuldadeColor } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";
import { Pencil } from "lucide-react";

const MATERIAS = [
  "Matemática",
  "Português",
  "História",
  "Biologia",
  "Física",
  "Química",
];
const DIFICULDADES = ["Fácil", "Médio", "Difícil"];

const BADGE_VARIANT = {
  Fácil: "green",
  Médio: "amber",
  Difícil: "red",
};

export default function ExerciciosPage() {
  const [materiaAtiva, setMateriaAtiva] = useState("Matemática");
  const [dificuldade, setDificuldade] = useState("Médio");
  const [questao, setQuestao] = useState(null);
  const [questaoId, setQuestaoId] = useState(null); // ID salvo no Supabase
  const [loading, setLoading] = useState(false);
  const [selectedLetra, setSelectedLetra] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Busca o usuário logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const gerarQuestao = useCallback(async () => {
    setLoading(true);
    setQuestao(null);
    setQuestaoId(null);
    setSelectedLetra(null);
    setShowFeedback(false);
    setError(null);

    try {
      const res = await fetch("/api/gerar-questao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prova: "ENEM",
          materia: materiaAtiva,
          dificuldade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuestao(data.questao);

      // Salva a questão gerada no Supabase
      const { data: materiaData } = await supabase
        .from("materia")
        .select("id")
        .eq("nome", materiaAtiva)
        .single();

      const { data: provaData } = await supabase
        .from("prova")
        .select("id")
        .eq("nome", "ENEM")
        .single();

      const { data: questaoSalva } = await supabase
        .from("questao")
        .insert({
          materia_id: materiaData?.id ?? null,
          prova_id: provaData?.id ?? null,
          enunciado: data.questao.enunciado,
          dificuldade: dificuldade,
          gabarito: data.questao.gabarito,
          explicacao: data.questao.explicacao,
        })
        .select()
        .single();

      if (questaoSalva) {
        setQuestaoId(questaoSalva.id);

        // Salva as alternativas
        const alternativas = data.questao.alternativas.map((alt) => ({
          questao_id: questaoSalva.id,
          letra: alt.letra,
          texto: alt.texto,
        }));
        await supabase.from("alternativa").insert(alternativas);
      }
    } catch (err) {
      setError(err.message ?? "Erro ao gerar questão.");
    } finally {
      setLoading(false);
    }
  }, [materiaAtiva, dificuldade]);

  async function handleSelectOpt(letra) {
    if (showFeedback || !questao) return;
    setSelectedLetra(letra);
    setShowFeedback(true);

    const correta = letra === questao.gabarito;
    setTotal((t) => t + 1);
    if (correta) setAcertos((a) => a + 1);

    // Salva a resposta no Supabase se houver usuário logado
    if (userId && questaoId) {
      await supabase.from("resposta_questao").insert({
        usuario_id: userId,
        questao_id: questaoId,
        alternativa_escolhida: letra,
        correta,
      });
    }
  }

  const isCorreto = selectedLetra === questao?.gabarito;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">
            Exercícios
          </h1>
          <p className="text-gray-400 text-sm">
            IA gera questões únicas baseadas no ENEM
          </p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Acertos hoje</p>
            <p className="font-sora font-bold text-xl text-success-400">
              {acertos}/{total}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-5 mb-5">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sora">
            Matéria
          </p>
          <div className="flex flex-wrap gap-2">
            {MATERIAS.map((m) => (
              <button
                key={m}
                onClick={() => setMateriaAtiva(m)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold font-sora border transition-all",
                  materiaAtiva === m
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-500",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-sora">
            Dificuldade
          </p>
          <div className="flex gap-2">
            {DIFICULDADES.map((d) => (
              <button
                key={d}
                onClick={() => setDificuldade(d)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold font-sora border transition-all",
                  dificuldade === d
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-500",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={gerarQuestao} loading={loading}>
           Gerar questão com IA
        </Button>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 mb-4 border-danger-400 bg-danger-50">
          <p className="text-sm text-danger-600 font-medium">⚠️ {error}</p>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="p-8 text-center mb-4">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            IA gerando questão de <strong>{materiaAtiva}</strong> ({dificuldade}
            )...
          </p>
        </Card>
      )}

      {/* Question */}
      {questao && !loading && (
        <Card className="p-6 mb-4 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Badge variant="blue">ENEM</Badge>
              <Badge variant={BADGE_VARIANT[questao.dificuldade]}>
                {questao.dificuldade}
              </Badge>
              <Badge variant="gray">{questao.materia}</Badge>
            </div>
            {questao.fonte && (
              <span className="text-xs text-gray-400">{questao.fonte}</span>
            )}
          </div>

          <p className="text-gray-800 text-base leading-relaxed mb-6">
            {questao.enunciado}
          </p>

          <div className="space-y-3 mb-6">
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
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 focus:outline-none",
                    !showFeedback &&
                      "hover:border-brand-300 hover:bg-brand-50/40",
                    showCorrect && "border-success-400 bg-success-50",
                    showWrong && "border-danger-400 bg-danger-50",
                    isSelected &&
                      !showFeedback &&
                      "border-brand-500 bg-brand-50",
                    !isSelected &&
                      !showCorrect &&
                      !showWrong &&
                      "border-gray-100 bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sora flex-shrink-0",
                      showCorrect && "bg-success-400 text-white",
                      showWrong && "bg-danger-400 text-white",
                      isSelected && !showFeedback && "bg-brand-500 text-white",
                      !isSelected &&
                        !showCorrect &&
                        !showWrong &&
                        "bg-gray-100 text-gray-500",
                    )}
                  >
                    {alt.letra}
                  </span>
                  <span className="text-sm text-gray-700">{alt.texto}</span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div
              className={cn(
                "p-4 rounded-xl mb-4 border animate-fade-in",
                isCorreto
                  ? "bg-success-50 border-success-400/30"
                  : "bg-danger-50 border-danger-400/30",
              )}
            >
              <p
                className={cn(
                  "font-sora font-semibold text-sm mb-2",
                  isCorreto ? "text-success-600" : "text-danger-600",
                )}
              >
                {isCorreto
                  ? "✓ Resposta correta!"
                  : `✗ Incorreto — gabarito: ${questao.gabarito}`}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {questao.explicacao}
              </p>
            </div>
          )}

          {showFeedback && (
            <Button onClick={gerarQuestao} loading={loading}>
              Próxima questão →
            </Button>
          )}
        </Card>
      )}

      {/* Empty state */}
      {!questao && !loading && !error && (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4 p-2 flex justify-center"><Pencil size={60}/></div>
          <h3 className="font-sora font-semibold text-gray-700 mb-2">
            Pronto para praticar?
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Selecione a matéria e dificuldade acima, depois clique em{" "}
            <strong>Gerar questão com IA</strong>.
          </p>
          <Button onClick={gerarQuestao}>
             Gerar minha primeira questão
          </Button>
        </Card>
      )}
    </div>
  );
}
