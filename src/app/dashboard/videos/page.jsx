"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const FILTERS = [
  { label: "Matemática", icon: "📐" },
  { label: "Português",  icon: "📖" },
  { label: "História",   icon: "🌍" },
  { label: "Ciências",   icon: "🔬" },
  { label: "Redação",    icon: "✍️" },
  { label: "Física",     icon: "⚛️" },
  { label: "Química",    icon: "🧪" },
];

const BADGE_COLORS = {
  Matemática: "blue",
  Português:  "green",
  História:   "amber",
  Biologia:   "green",
  Física:     "blue",
  Química:    "red",
  Redação:    "amber",
  Ciências:   "green",
};

function VideoModal({ video, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          ✕
        </button>
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="p-4 bg-gray-900 text-white">
          <p className="font-sora font-semibold text-sm leading-snug mb-1">
            {video.titulo}
          </p>
          <p className="text-xs text-gray-400">{video.canal}</p>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, onClick }) {
  return (
    <Card hover className="overflow-hidden cursor-pointer group" onClick={onClick}>
      <div className="relative h-40 bg-gray-900 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
            <span className="text-4xl">🎥</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-brand-500/90 flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>

        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {video.duracao}
        </span>

        {video.recomendado && (
          <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-sora">
            IA Recomendou
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-sora font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">
          {video.titulo}
        </h3>
        <div className="flex items-center justify-between">
          <Badge variant={BADGE_COLORS[video.materia] ?? "gray"}>
            {video.materia}
          </Badge>
          <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
            {video.canal}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function VideosPage() {
  const [materiaAtiva, setMateriaAtiva] = useState("Matemática");
  const [busca,        setBusca]        = useState("");
  const [videos,       setVideos]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [videoAberto,  setVideoAberto]  = useState(null);
  const [query,        setQuery]        = useState("");

  

  useEffect(() => {
  let cancelado = false;

  async function carregar() {
    setLoading(true);
    setError(null);
    setVideos([]);

    try {
      const params = new URLSearchParams({ materia: materiaAtiva, max: "6" });
      if (busca.trim()) params.set("busca", busca.trim());

      const res  = await fetch(`/api/video-youtube?${params}`);
      const data = await res.json();

      if (cancelado) return;
      if (!res.ok) throw new Error(data.error);

      setVideos(data.videos ?? []);
      setQuery(data.query   ?? "");
    } catch (err) {
      if (!cancelado) setError(err.message ?? "Erro ao buscar vídeos.");
    } finally {
      if (!cancelado) setLoading(false);
    }
  }

  const timer = busca.trim()
    ? setTimeout(carregar, 600)  // debounce na busca
    : (carregar(), undefined);   // imediato na troca de matéria

  return () => {
    cancelado = true;
    clearTimeout(timer);
  };
}, [materiaAtiva, busca]);

  function handleLimparBusca() {
    setBusca("");
    
  }

  return (
    <div>
      {videoAberto && (
        <VideoModal video={videoAberto} onClose={() => setVideoAberto(null)} />
      )}

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-sora font-bold text-2xl text-gray-900 mb-1">Videoaulas</h1>
          <p className="text-gray-400 text-sm">
            Vídeos reais do YouTube filtrados para o ENEM
          </p>
        </div>
      </div>

      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search></Search>
        </span>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar vídeo... ex: funções quadráticas, guerra fria..."
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-colors font-dm bg-white"
        />
        {busca && (
          <button
            onClick={handleLimparBusca}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => { setMateriaAtiva(f.label); setBusca(""); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-sora border transition-all",
              materiaAtiva === f.label
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-500"
            )}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {!busca && (
        <p className="font-sora text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
           Vídeos de {materiaAtiva} para o ENEM
        </p>
      )}
      {busca && query && (
        <p className="font-sora text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          `Resultados para: ${busca}!`
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-5 bg-gray-100 rounded-full w-16 mt-2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="bg-danger-50 border border-danger-400/30 rounded-xl p-5 text-center">
          <p className="text-danger-600 font-semibold text-sm mb-2">⚠️ {error}</p>
          <button
            onClick={() => buscarVideos(materiaAtiva, busca)}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Tentar novamente →
          </button>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              onClick={() => setVideoAberto(v)}
            />
          ))}
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🎥</span>
          <p className="font-sora font-semibold text-gray-700 mb-2">
            Nenhum vídeo encontrado
          </p>
          <p className="text-sm text-gray-400">
            Tente outro termo de busca ou selecione outra matéria.
          </p>
        </div>
      )}
    </div>
  );
}