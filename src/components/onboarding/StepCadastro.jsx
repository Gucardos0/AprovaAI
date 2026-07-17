"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useOnboardingContext } from "./OnboardingContext";
import { supabase } from "@/lib/supabase-browser";

export function StepCadastro() {
  const router = useRouter();
  const { state } = useOnboardingContext();
  const d = state.diagnostico;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleContinue(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Cria o usuário — sessão já ativa automaticamente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Erro ao obter ID do usuário.");

      // 2. Busca o ID da prova selecionada
      const { data: provaData } = await supabase
        .from("prova")
        .select("id")
        .eq("nome", state.prova)
        .single();

      // 3. Salva o perfil na tabela usuario
      const { error: usuarioError } = await supabase.from("usuario").insert({
        id: userId,
        nome,
        email,
        prova_id: provaData?.id ?? null,
      });
      if (usuarioError) throw usuarioError;

      // 4. Salva o diagnóstico se existir
      if (d && provaData?.id) {
        const { data: diagData } = await supabase
          .from("diagnostico")
          .insert({
            usuario_id: userId,
            prova_id: provaData.id,
            pontuacao: d.pontuacao,
            nivel: d.nivel,
          })
          .select()
          .single();

        if (diagData) {
          const materias = [
            ...d.pontosFortes.map((m) => ({ materia: m, tipo: "ponto_forte" })),
            ...d.pontosFracos.map((m) => ({ materia: m, tipo: "ponto_fraco" })),
          ];

          for (const item of materias) {
            const { data: materiaData } = await supabase
              .from("materia")
              .select("id")
              .eq("nome", item.materia)
              .single();

            if (materiaData) {
              await supabase.from("diagnostico_resultado_materia").insert({
                diagnostico_id: diagData.id,
                materia_id: materiaData.id,
                taxa_acerto: item.tipo === "ponto_forte" ? 0.8 : 0.4,
                tipo: item.tipo,
              });
            }
          }
        }
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message ?? "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <Logo className="justify-center mb-6" />

        <h2 className="font-sora font-bold text-2xl text-gray-900 text-center mb-2">
          Criar minha conta
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          Seu plano para <strong>{state.prova}</strong> já está personalizado!
        </p>

        {/* Plan preview */}
        {d && (
          <div className="bg-gradient-to-br from-brand-50 to-success-50 rounded-2xl p-4 mb-6 border border-brand-100">
            <p className="font-sora font-semibold text-sm text-brand-600 mb-3">
              🎯 Seu plano inclui:
            </p>
            {[
              `Foco em ${d.pontosFracos.join(" e ")} (seus pontos a melhorar)`,
              `Questões adaptativas baseadas no ${state.prova}`,
              "Cronograma personalizado até a prova",
              "Tutor IA disponível 24h",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-danger-50 border border-danger-400/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-danger-600">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-3">
          <input
            type="text"
            placeholder="Seu nome completo"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-brand-400 transition-colors font-dm"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-brand-400 transition-colors font-dm"
          />
          <input
            type="password"
            placeholder="Criar senha (mín. 8 caracteres)"
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-brand-400 transition-colors font-dm"
          />
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full justify-center"
          >
            Criar conta e ver meu plano →
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50/30 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
            />
          </svg>
          Continuar com Google
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Ao criar conta, você concorda com nossos{" "}
          <span className="text-brand-500 cursor-pointer">Termos de Uso</span>
        </p>
      </div>
    </div>
  );
}
