"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";
import { CalendarDays, Mailbox, Target, Video} from "lucide-react";

const DIAS_LABEL = {
  0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb",
};

const MATERIA_CORES = {
  "Matemática":          { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    },
  "Português":           { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-500"   },
  "Redação":             { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  "História":            { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    dot: "bg-pink-500"    },
  "Geografia":           { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-500"    },
  "Biologia":            { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Física":              { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500"  },
  "Química":             { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-500"  },
  "Artes e Literatura":  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500"    },
  "Inglês":              { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-500"    },
};

const COR_DEFAULT = { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-400" };

// Matérias do questionário com ícones
const MATERIAS_QUESTIONARIO = [
  { nome: "Matemática",          },
  { nome: "Português",           },
  { nome: "Redação",             },
  { nome: "História",            },
  { nome: "Geografia",           },
  { nome: "Biologia",            },
  { nome: "Física",              },
  { nome: "Química",             },
  { nome: "Artes e Literatura",  },
  { nome: "Inglês",              },
];

// Níveis do questionário
const NIVEIS = [
  {
    id:    "fraco",
    label: "Preciso melhorar",
    desc:  "Tenho dificuldade, quero mais aulas",
    icon:  "😟",
    cor:   "border-red-300 bg-red-50 text-red-700",
    corSel:"border-red-500 bg-red-100 text-red-800 ring-2 ring-red-400",
  },
  {
    id:    "medio",
    label: "Razoável",
    desc:  "Sei o básico, quero consolidar",
    icon:  "😐",
    cor:   "border-amber-300 bg-amber-50 text-amber-700",
    corSel:"border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-400",
  },
  {
    id:    "forte",
    label: "Me sinto bem",
    desc:  "Tenho facilidade, menos aulas",
    icon:  "😊",
    cor:   "border-emerald-300 bg-emerald-50 text-emerald-700",
    corSel:"border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400",
  },
];

// ── Questionário ──────────────────────────────────────────────────────────────
function Questionario({ diasAteEnem, totalSemanas, onConfirmar }) {
  const [respostas, setRespostas] = useState(
    Object.fromEntries(MATERIAS_QUESTIONARIO.map((m) => [m.nome, "medio"]))
  );

  const totalRespondidas = Object.values(respostas).filter(Boolean).length;
  const tudo = totalRespondidas === MATERIAS_QUESTIONARIO.length;

  function selecionar(materia, nivel) {
    setRespostas((prev) => ({ ...prev, [materia]: nivel }));
  }

  function confirmar() {
    const pontosFracos  = Object.entries(respostas).filter(([, v]) => v === "fraco" ).map(([k]) => k);
    const pontosFortes  = Object.entries(respostas).filter(([, v]) => v === "forte" ).map(([k]) => k);
    onConfirmar({ pontosFracos, pontosFortes });
  }

  return (
    <div className="max-w-2xl mx-auto py-8">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4"></div>
        <h1 className="font-sora font-bold text-2xl text-gray-900 mb-2">
          Como você se sente em cada matéria?
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Seja honesto — quanto mais certeiro você for, mais personalizado ficará seu plano.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-xs font-semibold text-brand-500 bg-brand-50 px-3 py-1 rounded-full">
             {diasAteEnem} dias para o ENEM
          </span>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
             {totalSemanas} semanas de plano
          </span>
        </div>
      </div>

      {/* Legenda dos níveis */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {NIVEIS.map((n) => (
          <div key={n.id} className={cn("rounded-xl border p-3 text-center", n.cor)}>
            <span className="text-xl block mb-1">{n.icon}</span>
            <p className="font-sora font-bold text-xs">{n.label}</p>
            <p className="text-[10px] mt-0.5 opacity-80">{n.desc}</p>
          </div>
        ))}
      </div>

      {/* Lista de matérias */}
      <div className="space-y-3 mb-8">
        {MATERIAS_QUESTIONARIO.map((m) => {
          const corMateria = MATERIA_CORES[m.nome] ?? COR_DEFAULT;
          return (
            <div
              key={m.nome}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              {/* Nome da matéria */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{m.icon}</span>
                <span className={cn("font-sora font-bold text-sm", corMateria.text)}>
                  {m.nome}
                </span>
              </div>

              {/* Botões de nível */}
              <div className="grid grid-cols-3 gap-2">
                {NIVEIS.map((n) => {
                  const selecionado = respostas[m.nome] === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => selecionar(m.nome, n.id)}
                      className={cn(
                        "rounded-xl border p-2.5 text-center transition-all duration-150 focus:outline-none",
                        selecionado ? n.corSel : n.cor,
                        "hover:opacity-90"
                      )}
                    >
                      <span className="text-base block mb-0.5">{n.icon}</span>
                      <span className="text-[10px] font-bold block leading-tight">
                        {n.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo antes de confirmar */}
      {tudo && (
        <div className="bg-brand-50 rounded-2xl p-4 mb-5 border border-brand-100">
          <p className="font-sora font-semibold text-brand-700 text-sm mb-3">
            Resumo do seu perfil:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Precisa melhorar", nivel: "fraco",  cor: "text-red-600",     bg: "bg-red-50"     },
              { label: "Razoável",         nivel: "medio",  cor: "text-amber-600",   bg: "bg-amber-50"   },
              { label: "Me sinto bem",     nivel: "forte",  cor: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((g) => {
              const materias = Object.entries(respostas)
                .filter(([, v]) => v === g.nivel)
                .map(([k]) => k);
              return (
                <div key={g.nivel} className={cn("rounded-xl p-3", g.bg)}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", g.cor)}>
                    {g.label}
                  </p>
                  {materias.length === 0 ? (
                    <p className="text-[10px] text-gray-400">Nenhuma</p>
                  ) : (
                    materias.map((mat) => (
                      <p key={mat} className={cn("text-[10px] font-semibold", g.cor)}>{mat}</p>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botão confirmar */}
      <button
        onClick={confirmar}
        disabled={!tudo}
        className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white font-sora font-bold py-4 rounded-2xl hover:bg-brand-600 transition-colors disabled:opacity-40 shadow-lg text-sm"
      >
         Gerar meu plano personalizado
      </button>
    </div>
  );
}

// ── VideoModal ────────────────────────────────────────────────────────────────
function VideoModal({ tarefa, onClose }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscar() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          materia: tarefa.materia?.nome ?? "",
          busca:   tarefa.titulo,
          max:     "1",
        });
        const res  = await fetch(`/api/youtube?${params}`);
        const data = await res.json();
        setVideoId(data.videos?.[0]?.id ?? null);
      } catch {
        setVideoId(null);
      } finally {
        setLoading(false);
      }
    }
    buscar();
  }, [tarefa]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cor = MATERIA_CORES[tarefa.materia?.nome] ?? COR_DEFAULT;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("px-5 py-4 flex items-center justify-between", cor.bg)}>
          <div>
            <span className={cn("text-xs font-bold uppercase tracking-wider", cor.text)}>
              {tarefa.materia?.nome}
            </span>
            <h2 className="font-sora font-bold text-gray-900 text-lg leading-tight mt-0.5">
              {tarefa.titulo}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : videoId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={tarefa.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center text-white">
            <span className="text-4xl mb-3"><Video></Video></span>
            <p className="font-sora font-semibold">Nenhum vídeo encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente buscar na aba Videoaulas</p>
          </div>
        )}

        <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">⏱ {tarefa.duracao_min} min estimados</p>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Marcar como concluído ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TarefaCard ────────────────────────────────────────────────────────────────
function TarefaCard({ tarefa, onClick, onConcluir }) {
  const cor = MATERIA_CORES[tarefa.materia?.nome] ?? COR_DEFAULT;
  const concluido = tarefa.status === "concluido";

  return (
    <div
      className={cn(
        "rounded-xl border p-3 cursor-pointer transition-all duration-150 hover:shadow-sm group",
        concluido ? "bg-gray-50 border-gray-100 opacity-70" : cn(cor.bg, cor.border)
      )}
      onClick={() => !concluido && onClick(tarefa)}
    >
      <div className="flex items-start gap-2">
        <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", concluido ? "bg-gray-300" : cor.dot)} />
        <div className="flex-1 min-w-0">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", concluido ? "text-gray-400" : cor.text)}>
            {tarefa.materia?.nome}
          </span>
          <p className={cn(
            "font-sora font-semibold text-xs leading-snug mt-0.5",
            concluido ? "text-gray-400 line-through" : "text-gray-800"
          )}>
            {tarefa.titulo}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400">⏱ {tarefa.duracao_min} min</span>
            {concluido ? (
              <span className="text-[10px] font-semibold text-emerald-500">✓ Concluído</span>
            ) : (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onClick(tarefa); }}
                  className={cn("text-[10px] font-semibold", cor.text)}
                >
                  ▶ Assistir
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onConcluir(tarefa.id); }}
                  className="text-[10px] font-semibold text-emerald-600"
                >
                  ✓ Feito
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PlanoPage() {
  const [etapa,          setEtapa]          = useState("carregando"); // carregando | questionario | gerando | plano
  const [semanaAtual,    setSemanaAtual]    = useState(0);
  const [tarefas,        setTarefas]        = useState([]);
  const [planoId,        setPlanoId]        = useState(null);
  const [tarefaAberta,   setTarefaAberta]   = useState(null);
  const [userId,         setUserId]         = useState(null);

const diasAteEnem = useMemo(() => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ano  = hoje.getFullYear();
  const enem = new Date(ano, 10, 8);
  if (enem <= hoje) enem.setFullYear(ano + 1);
  return Math.ceil((enem.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}, []);

const totalSemanas = useMemo(() => Math.ceil(diasAteEnem / 7), [diasAteEnem]);

  useEffect(() =>{
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setEtapa("questionario"); return; }
      setUserId(user.id);

      const { data: plano } = await supabase
        .from("plano_estudo")
        .select("id")
        .eq("usuario_id", user.id)
        .order("gerado_em", { ascending: false })
        .limit(1)
        .single();

      if (plano) {
        setPlanoId(plano.id);
        await carregarTarefas(plano.id, 0);
        setEtapa("plano");
      } else {
        setEtapa("questionario");
      }
    }
    carregar();
  }, []);

 async function carregarTarefas(id, semana, dataInicio = null) {
  let baseDate = dataInicio;

  if (!baseDate) {
    const { data: plano } = await supabase
      .from("plano_estudo")
      .select("data_inicio")
      .eq("id", id)
      .single();
    baseDate = plano?.data_inicio ?? new Date().toISOString().split("T")[0];
  }

  const inicio = new Date(baseDate + "T00:00:00");
  inicio.setDate(inicio.getDate() + semana * 7);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);

  // ← ADICIONA ISSO TEMPORARIAMENTE
  console.log("Buscando tarefas:");
  console.log("plano_id:", id);
  console.log("data inicio:", inicio.toISOString().split("T")[0]);
  console.log("data fim:", fim.toISOString().split("T")[0]);

  const { data, error } = await supabase
    .from("tarefa")
    .select("id, titulo, status, duracao_min, data_prevista, materia(nome)")
    .eq("plano_id", id)
    .gte("data_prevista", inicio.toISOString().split("T")[0])
    .lte("data_prevista", fim.toISOString().split("T")[0])
    .order("data_prevista", { ascending: true });

  // ← E ISSO
  console.log("Tarefas retornadas:", data);
  console.log("Erro:", error);

  setTarefas(data ?? []);
}

  async function gerarPlano({ pontosFracos, pontosFortes }) {
  if (!userId) return;
  setEtapa("gerando");
  try {
    const res = await fetch("/api/gerar-plano", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ usuarioId: userId, pontosFracos, pontosFortes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const hoje = new Date().toISOString().split("T")[0]; // ← data de hoje
    setPlanoId(data.planoId);
    await carregarTarefas(data.planoId, 0, hoje); // ← passa a data
    setEtapa("plano");
  } catch (err) {
    console.error(err);
    setEtapa("questionario");
  }
}

  async function trocarSemana(nova) {
    setSemanaAtual(nova);
    if (planoId) await carregarTarefas(planoId, nova);
  }

  async function marcarConcluido(tarefaId) {
    await supabase.from("tarefa").update({ status: "concluido" }).eq("id", tarefaId);
    setTarefas((prev) => prev.map((t) => t.id === tarefaId ? { ...t, status: "concluido" } : t));
  }

  // ── Agrupamento por dia ──
  const tarefasPorDia = {};
  tarefas.forEach((t) => {
    const data = new Date(t.data_prevista + "T00:00:00");
    const dia  = data.getDay();
    if (!tarefasPorDia[dia]) tarefasPorDia[dia] = [];
    tarefasPorDia[dia].push(t);
  });

  const diasComTarefas = Object.keys(tarefasPorDia).map(Number).sort((a, b) => a - b);
  const concluidas     = tarefas.filter((t) => t.status === "concluido").length;
  const progresso      = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

  const dataInicioSemana = new Date();
  dataInicioSemana.setDate(dataInicioSemana.getDate() + semanaAtual * 7);
  const dataFimSemana = new Date(dataInicioSemana);
  dataFimSemana.setDate(dataFimSemana.getDate() + 6);

  const formatarData = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  // ── Etapa: carregando ──
  if (etapa === "carregando") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Etapa: questionário ──
  if (etapa === "questionario") {
    return (
      <Questionario
        diasAteEnem={diasAteEnem}
        totalSemanas={totalSemanas}
        onConfirmar={gerarPlano}
      />
    );
  }

  // ── Etapa: gerando ──
  if (etapa === "gerando") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-5" />
        <p className="font-sora font-bold text-gray-800 text-lg mb-1">Gerando seu plano...</p>
        <p className="text-gray-400 text-sm">
          Estamos organizando {totalSemanas} semanas de estudo para você <Target></Target>
        </p>
      </div>
    );
  }

  // ── Etapa: plano ──
  return (
    <div>
      {tarefaAberta && (
        <VideoModal tarefa={tarefaAberta} onClose={() => setTarefaAberta(null)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">Plano de Estudos</h1>
          <p className="text-gray-400 text-sm">Personalizado por você · {diasAteEnem} dias para o ENEM</p>
        </div>
        <button
          onClick={() => setEtapa("questionario")}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 font-sora font-semibold text-sm px-4 py-2.5 rounded-xl hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          🔄 Refazer questionário
        </button>
      </div>

      {/* Progresso da semana */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-400 rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-100 text-xs mb-0.5">Semana {semanaAtual + 1} de {totalSemanas}</p>
            <p className="font-sora font-bold text-lg">
              {formatarData(dataInicioSemana)} — {formatarData(dataFimSemana)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-sora font-bold text-3xl">{progresso}%</p>
            <p className="text-blue-100 text-xs">da semana concluído</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="text-blue-100 text-xs mt-2">{concluidas} de {tarefas.length} aulas concluídas</p>
      </div>

      {/* Navegação de semanas */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => trocarSemana(Math.max(0, semanaAtual - 1))}
          disabled={semanaAtual === 0}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-300 hover:text-brand-500 transition-all disabled:opacity-30"
        >←</button>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: Math.min(totalSemanas, 8) }, (_, i) => (
            <button
              key={i}
              onClick={() => trocarSemana(i)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold font-sora transition-all",
                semanaAtual === i
                  ? "bg-brand-500 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-500"
              )}
            >
              Sem. {i + 1}
            </button>
          ))}
          {totalSemanas > 8 && (
            <span className="text-xs text-gray-400 self-center px-2">+{totalSemanas - 8} semanas</span>
          )}
        </div>

        <button
          onClick={() => trocarSemana(Math.min(totalSemanas - 1, semanaAtual + 1))}
          disabled={semanaAtual === totalSemanas - 1}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-300 hover:text-brand-500 transition-all disabled:opacity-30"
        >→</button>
      </div>

      {/* Grid de dias */}
      {diasComTarefas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-4xl mb-3 block"></span>
          <p className="font-sora font-semibold text-gray-600 mb-1">Nenhuma tarefa nessa semana</p>
          <p className="text-sm">Navegue para outra semana.</p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${diasComTarefas.length}, minmax(0, 1fr))` }}
        >
          {diasComTarefas.map((dia) => {
            const dataDia = new Date(dataInicioSemana);
            dataDia.setDate(dataDia.getDate() + ((dia - dataInicioSemana.getDay() + 7) % 7));
            const isHoje = dataDia.toDateString() === new Date().toDateString();

            return (
              <div key={dia}>
                <div className={cn("text-center mb-3 pb-2 border-b", isHoje ? "border-brand-300" : "border-gray-100")}>
                  <p className={cn("font-sora font-bold text-sm", isHoje ? "text-brand-500" : "text-gray-700")}>
                    {DIAS_LABEL[dia]}
                  </p>
                  <p className={cn("text-xs", isHoje ? "text-brand-400" : "text-gray-400")}>
                    {formatarData(dataDia)}
                    {isHoje && <span className="ml-1 text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full">hoje</span>}
                  </p>
                </div>
                <div className="space-y-2">
                  {tarefasPorDia[dia]?.map((tarefa) => (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      onClick={setTarefaAberta}
                      onConcluir={marcarConcluido}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

