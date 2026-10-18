"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import { BotMessageSquare, Camera, Flame, Hourglass, PartyPopper, Pencil, StickyNote, Target, Video,    } from "lucide-react";


const ACOES = [
  {
    href: "/dashboard/exercicios",
    icon: <Pencil></Pencil>,
    bg: "bg-brand-50",
    label: "Resolver exercícios",
    sub: "Questões com IA",
  },
  {
    href: "/dashboard/redacao",
    icon: <StickyNote></StickyNote>,
    bg: "bg-success-50",
    label: "Treinar redação",
    sub: "Tema do dia",
  },
  {
    href: "/dashboard/videos",
    icon: <Video></Video>,
    bg: "bg-amber-50",
    label: "Assistir videoaula",
    sub: "Recomendado pela IA",
  },
  {
    href: "/dashboard/ia",
    icon: <BotMessageSquare></BotMessageSquare>,
    bg: "bg-pink-50",
    label: "Falar com IA",
    sub: "Tirar dúvidas",
  },
];

const STATUS_CLASSES = {
  done: "bg-success-100 text-success-700",
  progress: "bg-brand-100 text-brand-700",
  pending: "bg-slate-100 text-slate-600",
};

function diasParaEnem() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const enem = new Date(ano, 10, 8);
  if (enem < hoje) enem.setFullYear(ano + 1);
  const diff = Math.ceil((enem - hoje) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function DashboardPage() {
  const [perfil, setPerfil] = useState(null);
  const [stats, setStats] = useState({
    questoes: 0,
    acertos: 0,
    redacoes: 0,
  });
  const [tarefas, setTarefas] = useState([]);
  const [desempenho, setDesempenho] = useState([]);
  const [loading, setLoading] = useState(true);

  const diasEnem = diasParaEnem();

  useEffect(() => {
    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: usuarioData } = await supabase
        .from("usuario")
        .select("nome, prova(nome)")
        .eq("id", user.id)
        .single();
      setPerfil(usuarioData);

      const { data: respostas } = await supabase
        .from("resposta_questao")
        .select("correta, questao(materia(nome))")
        .eq("usuario_id", user.id);

      if (respostas) {
        const total = respostas.length;
        const acertos = respostas.filter((r) => r.correta).length;

        const porMateria = {};
        respostas.forEach((r) => {
          const nome = r.questao?.materia?.nome;
          if (!nome) return;
          if (!porMateria[nome]) porMateria[nome] = { acertos: 0, total: 0 };
          porMateria[nome].total++;
          if (r.correta) porMateria[nome].acertos++;
        });

        const cores = {
          Matemática: "bg-brand-500",
          Biologia: "bg-success-500",
          Física: "bg-brand-500",
          Português: "bg-amber-500",
          História: "bg-red-500",
          Redação: "bg-amber-500",
        };

        setDesempenho(
          Object.entries(porMateria)
            .map(([nome, v]) => ({
              nome,
              pct: Math.round((v.acertos / v.total) * 100),
              cor: cores[nome] ?? "bg-slate-400",
            }))
            .sort((a, b) => b.pct - a.pct)
            .slice(0, 6),
        );

        setStats((s) => ({ ...s, questoes: total, acertos }));
      }

      const { count: totalRedacoes } = await supabase
        .from("redacao")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", user.id);
      setStats((s) => ({ ...s, redacoes: totalRedacoes ?? 0 }));

      const hoje = new Date().toISOString().split("T")[0];
      const { data: tarefasData } = await supabase
        .from("tarefa")
        .select("titulo, status, duracao_min, materia(nome)")
        .eq("data_prevista", hoje)
        .limit(4);

      if (tarefasData) {
        const icones = {
          Matemática: "📐",
          Português: "📖",
          Redação: "✍️",
          História: "🌍",
          Biologia: "🔬",
          Física: "⚛️",
          Química: "🧪",
        };
        const bgs = {
          Matemática: "bg-brand-50",
          Português: "bg-amber-50",
          Redação: "bg-success-50",
          História: "bg-pink-50",
        };
        const statusLabel = {
          pendente: "Pendente",
          em_andamento: "Fazendo",
          concluido: "Feito",
        };
        const statusKey = {
          pendente: "pending",
          em_andamento: "progress",
          concluido: "done",
        };

        setTarefas(
          tarefasData.map((t) => ({
            titulo: t.titulo,
            meta: `${t.materia?.nome ?? "—"} · ${t.duracao_min} min`,
            icon: icones[t.materia?.nome] ?? "📚",
            bg: bgs[t.materia?.nome] ?? "bg-slate-50",
            status: statusKey[t.status] ?? "pending",
            statusLabel: statusLabel[t.status] ?? "Pendente",
          })),
        );
      }

      setLoading(false);
    }
    carregar();
  }, []);

  const taxa =
    stats.questoes > 0
      ? Math.round((stats.acertos / stats.questoes) * 100)
      : 0;
  const primeiroNome = perfil?.nome?.split(" ")[0] ?? "estudante";

  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  // =====================================================================
  // A PARTIR DAQUI: APENAS ALTERAÇÕES VISUAIS (FRONT-END)
  // =====================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* ── HEADER  ──────────────────── */}
      <div className="relative rounded-[2rem] overflow-hidden bg-[#E8F5E9] px-8 py-10 shadow-sm border border-success-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <p className="text-success-700 font-medium text-sm mb-2 uppercase tracking-wider">{saudacao} </p>
          <h1 className="font-sora font-extrabold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            Misture foco na sua rotina, {primeiroNome}.
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-white text-slate-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm border border-success-50">
              <Target></Target> Faltam <strong className="text-success-600">{diasEnem} dias</strong> para o ENEM
            </span>
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
              <Flame></Flame> 7 dias de ofensiva
            </span>
          </div>
        </div>
        {/* Elemento gráfico abstrato para preencher espaço (Substituindo o cérebro/ilustração) */}
        <div className="hidden md:flex relative z-10 w-32 h-32 bg-success-200 rounded-full opacity-50 blur-2xl"></div>
      </div>

      {/* ── STATS  ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Questões Resolvidas", value: stats.questoes, color: "text-slate-800", bg: "bg-white", sub: "no total", icon: <StickyNote></StickyNote> },
          { label: "Taxa de Acerto", value: `${taxa}%`, color: "text-brand-600", bg: "bg-brand-50", sub: `${stats.acertos} corretas`, icon: <Target></Target> },
          { label: "Redações Entregues", value: stats.redacoes, color: "text-slate-800", bg: "bg-white", sub: "corrigidas por IA", icon: <Pencil></Pencil> },
          { label: "Contagem Regressiva", value: diasEnem, color: "text-slate-800", bg: "bg-white", sub: "dias restantes", icon: <Hourglass></Hourglass> },
        ].map((s, i) => (
          <Card key={i} className={`p-6 rounded-2xl border-none shadow-sm ${s.bg}`}>
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-slate-500">{s.label}</p>
                <span className="text-xl opacity-80">{s.icon}</span>
              </div>
              <div>
                <p className={`font-sora font-extrabold text-4xl ${s.color} mb-1 tracking-tight`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── AÇÕES RÁPIDAS (ESTILO DESCOMPLICA - BLOCOS COLORIDOS) ─ */}
      <div>
        <h2 className="text-xl font-sora font-bold text-slate-800 mb-4">O que vamos estudar agora?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACOES.map((a) => (
            <Link key={a.href} href={a.href} className="block group">
              <Card className="p-6 text-left rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-1 bg-white h-full">
                <div className={`w-14 h-14 ${a.bg} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {a.icon}
                </div>
                <p className="font-sora font-bold text-slate-800 text-base mb-1 group-hover:text-brand-600 transition-colors">
                  {a.label}
                </p>
                <p className="text-xs text-slate-500 font-medium">{a.sub}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── GRID PRINCIPAL (DASHBOARD) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Desempenho por matéria */}
        <Card className="lg:col-span-2 p-6 rounded-3xl border border-slate-100 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-sora font-bold text-lg text-slate-800">Seu Desempenho</h3>
              <p className="text-sm text-slate-500 mt-1">Aproveitamento geral por disciplina</p>
            </div>
            <Link href="/dashboard/exercicios" className="text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-full transition-colors">
              Praticar mais
            </Link>
          </div>
          
          {desempenho.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl mb-3"></span>
              <p className="font-sora font-bold text-slate-700 text-sm mb-1">Ainda não há dados</p>
              <p className="text-sm text-slate-500 text-center px-4">Resolva exercícios para acompanhar sua evolução.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {desempenho.map((m) => (
                <div key={m.nome} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700 w-28 flex-shrink-0">
                    {m.nome}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${m.cor} h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-800 font-sora w-12 text-right">
                    {m.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tarefas de hoje */}
        <Card className="lg:col-span-1 p-6 rounded-3xl border border-slate-100 shadow-sm bg-white">
          <div className="mb-6">
            <h3 className="font-sora font-bold text-lg text-slate-800">Plano de Hoje</h3>
            <p className="text-sm text-slate-500 mt-1 capitalize">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
          </div>

          {tarefas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-4xl mb-3"><PartyPopper></PartyPopper></span>
              <p className="font-sora font-bold text-slate-700 text-sm mb-1">Tudo limpo!</p>
              <p className="text-sm text-slate-500">Nenhuma meta pendente para hoje.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tarefas.map((t) => (
                <div
                  key={t.titulo}
                  className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sora font-bold text-slate-800 text-sm truncate group-hover:text-brand-600 transition-colors">
                      {t.titulo}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{t.meta}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_CLASSES[t.status]}`}>
                    {t.statusLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
        
      </div>
    </div>
  );
}