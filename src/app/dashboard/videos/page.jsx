import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const VIDEOS = [
  { titulo: "Redação ENEM: Como estruturar a proposta de intervenção", materia: "Redação", dur: "18:42", rec: true, bg: "from-pink-50 to-pink-100" },
  { titulo: "Guerra Fria — Do início ao fim com mapas e cronologia", materia: "História", dur: "24:15", rec: true, bg: "from-amber-50 to-amber-100" },
  { titulo: "Gramática: Coesão e coerência textual para o ENEM", materia: "Português", dur: "31:08", rec: true, bg: "from-brand-50 to-brand-100" },
  { titulo: "Probabilidade e Combinatória — Questões ENEM comentadas", materia: "Matemática", dur: "22:30", rec: false, bg: "from-success-50 to-green-100" },
  { titulo: "Genética — Doenças hereditárias e probabilidade", materia: "Biologia", dur: "15:44", rec: false, bg: "from-amber-50 to-yellow-100" },
  { titulo: "Termoquímica — Entalpia e cálculos de calorimetria", materia: "Química", dur: "19:57", rec: false, bg: "from-danger-50 to-red-100" },
];

const FILTERS = ["Recomendados", "Matemática", "Português", "História", "Ciências", "Redação"];

export default function VideosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">Videoaulas</h1>
        <p className="text-gray-400 text-sm">Recomendações baseadas no seu desempenho pela IA</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold font-sora border transition-all",
              i === 0
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-500"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* IA recommended label */}
      <p className="font-sora text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        🎯 Para você — baseado nos seus pontos fracos
      </p>

      {/* Video grid */}
      <div className="grid grid-cols-3 gap-4">
        {VIDEOS.map((v) => (
          <Card key={v.titulo} hover className="overflow-hidden">
            {/* Thumbnail */}
            <div className={cn("h-36 bg-gradient-to-br flex items-center justify-center relative", v.bg)}>
              <button className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center shadow-lg hover:bg-brand-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </button>
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                {v.dur}
              </span>
              {v.rec && (
                <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-sora">
                  IA Recomendou
                </span>
              )}
            </div>
            {/* Info */}
            <div className="p-3">
              <h3 className="font-sora font-semibold text-gray-800 text-sm leading-snug mb-2">
                {v.titulo}
              </h3>
              <Badge variant="gray">{v.materia}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
