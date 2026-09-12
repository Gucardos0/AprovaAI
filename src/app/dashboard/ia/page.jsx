"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";
import { BotMessageSquare, User} from "lucide-react";

const SUGGESTIONS = [
  "Explique a Guerra Fria de forma simples",
  "Crie 3 questões de Matemática para mim",
  "Como estruturar uma boa redação ENEM?",
  "Quais temas caem mais no ENEM?",
  "Me explique funções quadráticas",
  "Dicas para gestão de tempo na prova",
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Olá! Sou sua IA Tutora da AprovaAI \n\nAnalisei seus resultados e vi que você pode melhorar em **Redação** e **História**. Quer que eu explique algum tema, crie questões personalizadas ou tire alguma dúvida?\n\nEstou aqui para te ajudar a conquistar sua aprovação! ",
};

export default function IAPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [sessaoId, setSessaoId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pontosFracos, setPontosFracos] = useState(["Redação", "História"]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cria sessão de chat ao entrar na página
  useEffect(() => {
    async function iniciarSessao() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Busca pontos fracos do último diagnóstico
      const { data: diagData } = await supabase
        .from("diagnostico_resultado_materia")
        .select("materia(nome), tipo")
        .eq("tipo", "ponto_fraco")
        .order("created_at", { ascending: false })
        .limit(2);

      if (diagData?.length > 0) {
        setPontosFracos(diagData.map((d) => d.materia?.nome).filter(Boolean));
      }

      // Busca prova do aluno
      const { data: usuarioData } = await supabase
        .from("usuario")
        .select("prova(id)")
        .eq("id", user.id)
        .single();

      // Cria nova sessão de chat
      const { data: sessao } = await supabase
        .from("chat_sessao")
        .insert({
          usuario_id: user.id,
          prova_id: usuarioData?.prova?.id ?? null,
        })
        .select()
        .single();

      if (sessao) setSessaoId(sessao.id);
    }
    iniciarSessao();
  }, []);

  async function salvarMensagem(papel, conteudo) {
    if (!sessaoId) return;
    await supabase.from("chat_mensagem").insert({
      sessao_id: sessaoId,
      papel,
      conteudo,
    });
  }

  async function sendMessage(text) {
    const msg = text ?? input.trim();
    if (!msg || streaming) return;

    setInput("");
    setError(null);

    const userMsg = { role: "user", content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    // Salva mensagem do usuário no Supabase
    await salvarMensagem("user", msg);

    const aiMsg = { role: "assistant", content: "" };
    setMessages([...newHistory, aiMsg]);
    setStreaming(true);

    let respostaFinal = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          prova: "ENEM",
          pontosFracos,
        }),
      });

      if (!res.ok) throw new Error("Erro ao conectar com a IA.");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (!reader) throw new Error("Stream não disponível.");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const deltaText = parsed.delta ?? "";
              const nextAccumulated = accumulated + deltaText;
              accumulated = nextAccumulated;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: nextAccumulated,
                };
                return updated;
              });
            } catch {}
          }
        }
      }

      respostaFinal = accumulated;
    } catch (err) {
      setError(err.message ?? "Erro desconhecido.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
      // Salva resposta da IA no Supabase após o streaming terminar
      if (respostaFinal) await salvarMensagem("assistant", respostaFinal);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-xl">
          <BotMessageSquare></BotMessageSquare>
        </div>
        <div>
          <h1 className="font-sora font-bold text-lg text-gray-900">
            IA Tutora AprovaAI
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse-slow" />
            <span className="text-xs text-gray-400">
              Online · Especialista em ENEM
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2.5 animate-fade-up",
              msg.role === "user" && "flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                msg.role === "assistant"
                  ? "bg-brand-50 text-brand-500"
                  : "bg-gray-100",
              )}
            >
              {msg.role === "assistant" ? <BotMessageSquare></BotMessageSquare> : <User></User>}
            </div>
            <div
              className={cn(
                "max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "assistant"
                  ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                  : "bg-brand-500 text-white rounded-tr-sm",
              )}
            >
              {msg.content}
              {streaming &&
                i === messages.length - 1 &&
                msg.role === "assistant" && (
                  <span className="inline-block w-0.5 h-4 bg-brand-400 ml-0.5 animate-pulse align-middle" />
                )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-400/20 rounded-xl px-4 py-2.5 mb-3">
          <p className="text-sm text-danger-600"> {error}</p>
        </div>
      )}

      {messages.length <= 2 && !streaming && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte qualquer coisa sobre seus estudos..."
          disabled={streaming}
          className="flex-1 px-5 py-3 rounded-full border border-gray-200 text-sm outline-none focus:border-brand-400 transition-colors font-dm disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || streaming}
          className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-600 transition-colors flex-shrink-0"
        >
          {streaming ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
