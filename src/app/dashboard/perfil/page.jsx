import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const STATS = [
  { label: "Dias estudando", value: "47" },
  { label: "Questões feitas", value: "248" },
  { label: "Taxa de acerto", value: "74%", color: "text-success-400" },
  { label: "Redações feitas", value: "12" },
];

const CONQUISTAS = [
  { icon: "🔥", nome: "7 dias seguidos", earned: true },
  { icon: "📝", nome: "10 redações", earned: true },
  { icon: "💯", nome: "100 questões", earned: true },
  { icon: "🎓", nome: "Mestre de Mat.", earned: true },
  { icon: "🏆", nome: "Top 100", earned: false },
  { icon: "⚡", nome: "30 dias", earned: false },
  { icon: "🌟", nome: "Nota 900+", earned: false },
  { icon: "🎯", nome: "500 questões", earned: false },
  { icon: "📚", nome: "Todas matérias", earned: false },
  { icon: "🚀", nome: "Aprovado!", earned: false },
];

const MATERIAS_HIST = [
  { nome: "Matemática", pct: 82, cor: "bg-brand-400" },
  { nome: "Biologia", pct: 78, cor: "bg-success-400" },
  { nome: "Física", pct: 71, cor: "bg-brand-300" },
  { nome: "Português", pct: 58, cor: "bg-amber-400" },
  { nome: "História", pct: 45, cor: "bg-red-400" },
  { nome: "Redação", pct: 52, cor: "bg-amber-400" },
];

export default function PerfilPage() {
  return (
    <div>
      <h1 className="font-sora font-bold text-2xl text-gray-900 mb-6">Meu Perfil</h1>

      {/* Profile card */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-success-400 flex items-center justify-center text-white font-sora font-bold text-2xl flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <h2 className="font-sora font-bold text-xl text-gray-900 mb-1">Ana Carolina Silva</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-500 text-xs font-semibold font-sora px-3 py-1 rounded-full">
                ⭐ Nível 7 — Desafiante
              </span>
              <span className="text-xs text-gray-400">· ENEM 2025</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">XP Total</p>
            <p className="font-sora font-bold text-2xl text-brand-500">3.240</p>
          </div>
        </div>

        <div className="mb-1 flex justify-between">
          <span className="text-xs text-gray-400">XP para nível 8</span>
          <span className="text-xs font-semibold text-brand-500 font-sora">3.240 / 4.000</span>
        </div>
        <ProgressBar value={3240} max={4000} color="gradient" />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {STATS.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`font-sora font-bold text-2xl ${s.color ?? "text-gray-800"}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Conquistas */}
        <Card className="col-span-3 p-5">
          <p className="font-sora font-semibold text-gray-800 mb-4">Conquistas</p>
          <div className="grid grid-cols-5 gap-3">
            {CONQUISTAS.map((c) => (
              <div key={c.nome} className="text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-1.5 ${
                  c.earned ? "bg-gradient-to-br from-amber-50 to-amber-100" : "bg-gray-100"
                }`}>
                  <span className={c.earned ? "" : "opacity-30"}>{c.icon}</span>
                </div>
                <p className={`text-[10px] leading-tight ${c.earned ? "text-gray-500" : "text-gray-300"}`}>
                  {c.nome}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance */}
        <Card className="col-span-2 p-5">
          <p className="font-sora font-semibold text-gray-800 mb-4">Desempenho</p>
          <div className="space-y-3">
            {MATERIAS_HIST.map((m) => (
              <div key={m.nome}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{m.nome}</span>
                  <span className="text-xs font-semibold text-gray-700 font-sora">{m.pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`${m.cor} h-full rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
