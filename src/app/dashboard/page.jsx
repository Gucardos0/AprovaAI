import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

const STATS = [
  { label: "Progresso geral", value: "62%", color: "text-brand-500", sub: "do conteúdo concluído" },
  { label: "Questões feitas", value: "248", color: "text-gray-800", sub: "↑ +34 essa semana" },
  { label: "Taxa de acerto", value: "74%", color: "text-success-400", sub: "↑ +8% vs semana passada" },
  { label: "Horas estudadas", value: "38h", color: "text-gray-800", sub: "Meta: 40h/mês" },
];

const ACOES = [
  { href: "/dashboard/exercicios", icon: "✏️", bg: "bg-brand-50", label: "Resolver exercícios", sub: "12 questões novas" },
  { href: "/dashboard/redacao", icon: "📝", bg: "bg-success-50", label: "Treinar redação", sub: "Tema do dia" },
  { href: "/dashboard/videos", icon: "🎥", bg: "bg-amber-50", label: "Assistir videoaula", sub: "Recomendado pela IA" },
  { href: "/dashboard/ia", icon: "🤖", bg: "bg-pink-50", label: "Falar com IA", sub: "Tirar dúvidas" },
];

const MATERIAS = [
  { nome: "Matemática", pct: 82, cor: "bg-brand-400" },
  { nome: "Biologia", pct: 78, cor: "bg-success-400" },
  { nome: "Física", pct: 71, cor: "bg-brand-400" },
  { nome: "Português", pct: 58, cor: "bg-amber-400" },
  { nome: "História", pct: 45, cor: "bg-red-400" },
  { nome: "Redação", pct: 52, cor: "bg-amber-400" },
];

const TAREFAS = [
  { icon: "📐", bg: "bg-brand-50", titulo: "Funções Quadráticas", meta: "Matemática · 45 min", status: "done", statusLabel: "Feito" },
  { icon: "📖", bg: "bg-amber-50", titulo: "Interpretação de texto", meta: "Português · 30 min", status: "progress", statusLabel: "Fazendo" },
  { icon: "✍️", bg: "bg-success-50", titulo: "Redação: Tecnologia", meta: "Redação · 60 min", status: "pending", statusLabel: "Pendente" },
  { icon: "🌍", bg: "bg-pink-50", titulo: "Geopolítica Mundial", meta: "História · 40 min", status: "pending", statusLabel: "Pendente" },
];

const STATUS_CLASSES = {
  done: "bg-success-50 text-success-400",
  progress: "bg-brand-50 text-brand-500",
  pending: "bg-amber-50 text-amber-600",
};

const data_atual = new Date()
const dia_atual = data_atual.getDate()
const mes_atual = data_atual.getMonth()
const dia_enem = 8
const mes_enem = 11
const dias_para_enem = (dia_atual > dia_enem)? dia_atual - dia_enem : dia_enem - data_atual
const mes_para_enem = (mes_atual > mes_enem)? mes_atual - mes_enem : mes_enem - mes_atual



export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">Boa tarde, Ana ! 👋</h1>
          <p className="text-gray-400 text-sm">Faltam {dias_para_enem} dias e  {mes_para_enem} meses para o ENEM. Vamos estudar?</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 text-sm font-semibold font-sora px-4 py-2 rounded-full">
          🔥 7 dias seguidos
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`font-sora font-bold text-2xl ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs text-success-400">{s.sub}</p>
            {s.label === "Progresso geral" && (
              <ProgressBar value={62} color="gradient" size="sm" className="mt-2" />
            )}
          </Card>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {ACOES.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card hover className="p-4 text-center">
              <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center text-xl mx-auto mb-3`}>
                {a.icon}
              </div>
              <p className="font-sora font-semibold text-gray-800 text-xs mb-1">{a.label}</p>
              <p className="text-[10px] text-gray-400">{a.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Performance chart */}
        <Card className="col-span-3 p-5">
          <p className="font-sora font-semibold text-gray-800 mb-4">
            Desempenho por matéria{" "}
            <span className="text-xs font-normal text-gray-400">últimas 4 semanas</span>
          </p>
          <div className="space-y-3">
            {MATERIAS.map((m) => (
              <div key={m.nome} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{m.nome}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`${m.cor} h-full rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-9 text-right">{m.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's tasks */}
        <Card className="col-span-2 p-5">
          <p className="font-sora font-semibold text-gray-800 mb-4">Tarefas de hoje</p>
          <div className="space-y-1">
            {TAREFAS.map((t) => (
              <div key={t.titulo} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-9 h-9 ${t.bg} rounded-xl flex items-center justify-center text-base flex-shrink-0`}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sora font-medium text-gray-800 text-xs truncate">{t.titulo}</p>
                  <p className="text-[10px] text-gray-400">{t.meta}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_CLASSES[t.status]}`}>
                  {t.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
