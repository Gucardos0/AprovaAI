"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TEMAS = [
  "O papel da tecnologia na redução das desigualdades sociais no Brasil",
  "Desafios para a valorização de comunidades e povos tradicionais no Brasil",
  "O estigma associado às doenças mentais na sociedade brasileira",
  "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
  "Perspectivas acerca do envelhecimento na sociedade brasileira",
  "Desafios para a valorização da herança africana no Brasil",
  "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil",
  "O desafio de reduzir as desigualdades entre as regiões do Brasil",
  "Democratização do acesso ao cinema no Brasil",
  "Manipulação do comportamento do usuário pelo controle de dados na Internet",
  "Desafios para a formação educacional de surdos no Brasil",
  "Caminhos para combater a intolerância religiosa no Brasil",
  "A persistência da violência contra a mulher na sociedade brasileira",
  "Publicidade infantil em questão no Brasil",
  "Efeitos da implantação da Lei Seca no Brasil",
  "Movimento imigratório para o Brasil no século 21",
  "Viver em rede no século XXI: os limites entre o público e o privado",
  "O trabalho na construção da dignidade humana",
  "Como preservar a floresta Amazônica",
];

function sortear3Temas() {
  const embaralhado = [...TEMAS].sort(() => Math.random() - 0.5);
  return embaralhado.slice(0, 3);
}

export default function RedacaoPage() {
  const [temasSorteados, setTemasSorteados] = useState(() => sortear3Temas());
  const [temaIdx, setTemaIdx] = useState(0);
  const [texto, setTexto] = useState("");
  const [correcao, setCorrecao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const palavras = texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length;
  const tema = temasSorteados[temaIdx];

  const handleSortear = useCallback(() => {
    setTemasSorteados(sortear3Temas());
    setTemaIdx(0);
    setCorrecao(null);
    setError(null);
  }, []);

  async function handleCorrigir() {
    if (palavras < 50) {
      setError("Escreva pelo menos 50 palavras para corrigir.");
      return;
    }
    setLoading(true);
    setError(null);
    setCorrecao(null);

    try {
      const res = await fetch("/api/corrigir-redacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, tema, prova: "ENEM" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCorrecao(data.correcao);
    } catch (err) {
      setError(err.message ?? "Erro ao corrigir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const notaColor = (nota, max) => {
    const pct = nota / max;
    if (pct >= 0.8) return "bg-success-400";
    if (pct >= 0.6) return "bg-amber-400";
    return "bg-danger-400";
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">Redação</h1>
          <p className="text-gray-400 text-sm">Escreva e receba correção com critérios reais do ENEM</p>
        </div>
        <Button onClick={handleCorrigir} loading={loading} disabled={palavras < 50}>
          🤖 Corrigir com IA
        </Button>
      </div>

      {/* Tema selector */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sora">
            Tema — escolha um dos sorteados
          </p>
          <button
            onClick={handleSortear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold font-sora text-gray-500 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 transition-all"
          >
            🎲 Sortear outros 3
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {temasSorteados.map((t, i) => (
            <button
              key={t}
              onClick={() => { setTemaIdx(i); setCorrecao(null); }}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                temaIdx === i
                  ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                  : "border-gray-100 hover:border-brand-200 text-gray-600"
              }`}
            >
              {temaIdx === i && <span className="font-sora font-bold text-brand-500 mr-2">→</span>}
              {t}
            </button>
          ))}
        </div>
      </Card>

      {/* Editor */}
      <Card className="mb-4 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100">
          {["B", "I", "U"].map((f) => (
            <button key={f} className="w-7 h-7 rounded-lg text-xs font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              {f}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <span className="text-xs text-gray-400 ml-2 font-sora">Tema: <span className="text-gray-600 font-medium">{tema.substring(0, 60)}...</span></span>
        </div>
        <textarea
          ref={textareaRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Comece a escrever sua redação aqui. Lembre-se: introdução, dois parágrafos de desenvolvimento e uma conclusão com proposta de intervenção."
          className="w-full min-h-72 px-6 py-5 text-gray-800 text-sm leading-relaxed outline-none font-dm resize-none placeholder:text-gray-300"
          style={{ fontFamily: "Georgia, serif", lineHeight: "1.9" }}
        />
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {palavras} palavra{palavras !== 1 ? "s" : ""}
            <span className="mx-2">·</span>
            Mín: 150 · Máx: 300
          </span>
          <span className={`text-xs font-semibold ${
            palavras < 150 ? "text-amber-600" : palavras > 300 ? "text-danger-400" : "text-success-400"
          }`}>
            {palavras < 150 ? `Faltam ${150 - palavras} palavras` : palavras > 300 ? "Acima do limite" : "✓ Dentro do limite"}
          </span>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 mb-4 bg-danger-50 border-danger-400">
          <p className="text-sm text-danger-600">⚠️ {error}</p>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card className="p-8 text-center mb-4">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">IA analisando sua redação com os critérios do ENEM...</p>
          <p className="text-gray-400 text-xs mt-1">Isso pode levar alguns segundos</p>
        </Card>
      )}

      {/* Correction result */}
      {correcao && (
        <Card className="p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-sora font-bold text-lg text-gray-900 mb-1">Correção pela IA</h3>
              <p className="text-xs text-gray-400">Baseada nos critérios oficiais do ENEM</p>
            </div>
            <div className="bg-brand-500 text-white font-sora font-bold text-2xl px-5 py-2.5 rounded-2xl">
              {correcao.nota} <span className="text-sm font-normal opacity-75">/ 1000</span>
            </div>
          </div>

          {/* Competencias */}
          <div className="space-y-3 mb-6">
            {correcao.competencias.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">{c.nome}</span>
                  <span className="text-xs font-semibold text-gray-700 font-sora">{c.nota}/{c.maximo}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${notaColor(c.nota, c.maximo)} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${(c.nota / c.maximo) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{c.feedback}</p>
              </div>
            ))}
          </div>

          {/* General feedback */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="font-sora font-semibold text-sm text-gray-700 mb-2">📋 Análise geral</p>
            <p className="text-sm text-gray-600 leading-relaxed">{correcao.feedbackGeral}</p>
          </div>

          {/* Points to improve */}
          {correcao.pontosMelhora.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="font-sora font-semibold text-sm text-amber-700 mb-3">💡 Principais pontos de melhora</p>
              <ul className="space-y-2">
                {correcao.pontosMelhora.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}