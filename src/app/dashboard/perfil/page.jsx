"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { supabase } from "@/lib/supabase-browser";
import { Star,Flame, Rocket, Target, Zap, Sparkles, GraduationCap, StickyNote, Trophy, CalendarDays, PartyPopper, } from "lucide-react";

const TODAS_CONQUISTAS = [
  { criterio: "7_dias_streak", icon: <Flame></Flame> , nome: "7 dias seguidos" },
  { criterio: "10_redacoes", icon: <StickyNote></StickyNote>, nome: "10 redações" },
  { criterio: "100_questoes", icon: <PartyPopper></PartyPopper>, nome: "100 questões" },
  { criterio: "90_pct_matematica", icon: <GraduationCap></GraduationCap>, nome: "Mestre de Mat." },
  { criterio: "top_100", icon: <Trophy></Trophy>, nome: "Top 100" },
  { criterio: "30_dias_streak", icon: <Zap></Zap>, nome: "30 dias" },
  { criterio: "900_redacao", icon: <Sparkles></Sparkles>, nome: "Nota 900+" },
  { criterio: "500_questoes", icon: <Target></Target>, nome: "500 questões" },
  { criterio: "plano_completo", icon: <CalendarDays></CalendarDays>, nome: "Todas matérias" },
  { criterio: "aprovado", icon: <Rocket></Rocket>, nome: "Aprovado!" },
];

export default function PerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [stats, setStats] = useState({
    questoes: 0,
    taxaAcerto: 0,
    redacoes: 0,
  });
  const [conquistasGanhas, setConquistasGanhas] = useState([]);
  const [desempenho, setDesempenho] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Perfil do usuário
      const { data: usuarioData } = await supabase
        .from("usuario")
        .select("nome, email, prova(nome)")
        .eq("id", user.id)
        .single();
      setPerfil(usuarioData);

      // Estatísticas de questões
      const { data: respostas } = await supabase
        .from("resposta_questao")
        .select("correta, questao(materia(nome))")
        .eq("usuario_id", user.id);

      if (respostas) {
        const total = respostas.length;
        const acertos = respostas.filter((r) => r.correta).length;
        const taxa = total > 0 ? Math.round((acertos / total) * 100) : 0;

        // Desempenho por matéria
        const porMateria = {};
        respostas.forEach((r) => {
          const nome = r.questao?.materia?.nome;
          if (!nome) return;
          if (!porMateria[nome]) porMateria[nome] = { acertos: 0, total: 0 };
          porMateria[nome].total++;
          if (r.correta) porMateria[nome].acertos++;
        });

        const cores = {
          Matemática: "bg-brand-400",
          Biologia: "bg-success-400",
          Física: "bg-brand-300",
          Português: "bg-amber-400",
          História: "bg-red-400",
          Redação: "bg-amber-400",
          Química: "bg-purple-400",
          Geografia: "bg-pink-400",
        };

        setDesempenho(
          Object.entries(porMateria).map(([nome, v]) => ({
            nome,
            pct: Math.round((v.acertos / v.total) * 100),
            cor: cores[nome] ?? "bg-gray-400",
          })),
        );

        setStats((s) => ({ ...s, questoes: total, taxaAcerto: taxa }));
      }

      // Contagem de redações
      const { count: totalRedacoes } = await supabase
        .from("redacao")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", user.id);
      setStats((s) => ({ ...s, redacoes: totalRedacoes ?? 0 }));

      // Conquistas ganhas
      const { data: conquistasData } = await supabase
        .from("usuario_conquista")
        .select("conquista(criterio)")
        .eq("usuario_id", user.id);
      const criteriosGanhos =
        conquistasData?.map((c) => c.conquista?.criterio) ?? [];
      setConquistasGanhas(criteriosGanhos);

      setLoading(false);
    }
    carregarDados();
  }, []);

  const inicial = perfil?.nome?.charAt(0)?.toUpperCase() ?? "?";
  const xp = stats.questoes * 10 + stats.redacoes * 50;
  const nivel = Math.floor(xp / 500) + 1;
  const xpProximoNivel = nivel * 500;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-sora font-bold text-2xl text-gray-900 mb-6">
        Meu Perfil
      </h1>

      {/* Profile card */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-success-400 flex items-center justify-center text-white font-sora font-bold text-2xl flex-shrink-0">
            {inicial}
          </div>
          <div className="flex-1">
            <h2 className="font-sora font-bold text-xl text-gray-900 mb-1">
              {perfil?.nome ?? "Usuário"}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-500 text-xs font-semibold font-sora px-3 py-1 rounded-full">
                <Star></Star> Nível {nivel}
              </span>
              <span className="text-xs text-gray-400">
                · {perfil?.prova?.nome ?? "ENEM"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">XP Total</p>
            <p className="font-sora font-bold text-2xl text-brand-500">
              {xp.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="mb-1 flex justify-between">
          <span className="text-xs text-gray-400">
            XP para nível {nivel + 1}
          </span>
          <span className="text-xs font-semibold text-brand-500 font-sora">
            {xp} / {xpProximoNivel}
          </span>
        </div>
        <ProgressBar value={xp} max={xpProximoNivel} color="gradient" />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "Questões feitas", value: stats.questoes },
          {
            label: "Taxa de acerto",
            value: `${stats.taxaAcerto}%`,
            color: "text-success-400",
          },
          { label: "Redações feitas", value: stats.redacoes },
          { label: "Conquistas", value: conquistasGanhas.length },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p
              className={`font-sora font-bold text-2xl ${s.color ?? "text-gray-800"}`}
            >
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Conquistas */}
        <Card className="col-span-3 p-5">
          <p className="font-sora font-semibold text-gray-800 mb-4">
            Conquistas
          </p>
          <div className="grid grid-cols-5 gap-3">
            {TODAS_CONQUISTAS.map((c) => {
              const earned = conquistasGanhas.includes(c.criterio);
              return (
                <div key={c.criterio} className="text-center">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-1.5 ${
                      earned
                        ? "bg-gradient-to-br from-amber-50 to-amber-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <span className={earned ? "" : "opacity-30"}>{c.icon}</span>
                  </div>
                  <p
                    className={`text-[10px] leading-tight ${earned ? "text-gray-500" : "text-gray-300"}`}
                  >
                    {c.nome}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Performance */}
        <Card className="col-span-2 p-5">
          <p className="font-sora font-semibold text-gray-800 mb-4">
            Desempenho
          </p>
          {desempenho.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              Responda questões para ver seu desempenho aqui!
            </p>
          ) : (
            <div className="space-y-3">
              {desempenho.map((m) => (
                <div key={m.nome}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">{m.nome}</span>
                    <span className="text-xs font-semibold text-gray-700 font-sora">
                      {m.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${m.cor} h-full rounded-full`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
