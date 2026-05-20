import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const DAYS = [
  { nome: "Seg", num: 17, tarefas: [
    { nome: "Funções", materia: "mat", tempo: "45 min", done: true },
    { nome: "Textos", materia: "port", tempo: "30 min", done: true },
  ]},
  { nome: "Ter", num: 18, tarefas: [
    { nome: "Geopolítica", materia: "hist", tempo: "40 min", done: true },
    { nome: "Redação", materia: "red", tempo: "60 min", done: true },
  ]},
  { nome: "Qua", num: 19, tarefas: [
    { nome: "Física Mod.", materia: "mat", tempo: "50 min", done: true },
  ]},
  { nome: "Qui", num: 20, today: true, tarefas: [
    { nome: "Interpretação", materia: "port", tempo: "30 min", progress: true },
    { nome: "Redação", materia: "red", tempo: "60 min", done: false },
    { nome: "História BR", materia: "hist", tempo: "35 min", done: false },
  ]},
  { nome: "Sex", num: 21, tarefas: [
    { nome: "Química", materia: "mat", tempo: "45 min", done: false },
    { nome: "Literatura", materia: "port", tempo: "30 min", done: false },
  ]},
  { nome: "Sáb", num: 22, tarefas: [
    { nome: "Simulado Completo", materia: "red", tempo: "3h", done: false },
  ]},
  { nome: "Dom", num: 23, tarefas: [] },
];

const MATERIA_COLORS = {
  mat: "bg-brand-50 text-brand-600",
  port: "bg-success-50 text-success-600",
  red: "bg-amber-50 text-amber-600",
  hist: "bg-pink-50 text-pink-600",
};

export default function PlanoPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">Plano de Estudos</h1>
          <p className="text-gray-400 text-sm">Adaptado para ENEM · Prioriza seus pontos fracos</p>
        </div>
        <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-300 hover:text-brand-500 transition-all">
          ⚙️ Ajustar plano
        </button>
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-3 mb-4">
        <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm hover:border-brand-300 transition-colors">←</button>
        <span className="font-sora font-semibold text-gray-800">Semana de 17–23 Mar 2025</span>
        <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm hover:border-brand-300 transition-colors">→</button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <Card
            key={day.num}
            className={cn("p-3", day.today && "border-brand-300 ring-1 ring-brand-200")}
          >
            <div className="text-center mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{day.nome}</p>
              <p className={cn("font-sora font-bold text-xl", day.today ? "text-brand-500" : "text-gray-700")}>
                {day.num}
              </p>
            </div>
            <div className="space-y-1.5">
              {day.tarefas.length === 0 ? (
                <p className="text-[10px] text-gray-300 text-center py-2">Descanso 😴</p>
              ) : (
                day.tarefas.map((t, i) => (
                  <div key={i} className={cn("rounded-lg p-2", MATERIA_COLORS[t.materia])}>
                    <p className="text-[10px] font-semibold leading-tight">{t.nome}</p>
                    <p className="text-[9px] opacity-70 mt-0.5">
                      {t.done ? "✓ " : t.progress ? "⟳ " : ""}{t.tempo}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        {[
          { cor: "bg-brand-50 border-brand-200", label: "Exatas" },
          { cor: "bg-success-50 border-success-400/30", label: "Linguagens" },
          { cor: "bg-amber-50 border-amber-200", label: "Redação" },
          { cor: "bg-pink-50 border-pink-200", label: "Humanas" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded border", l.cor)} />
            <span className="text-xs text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
