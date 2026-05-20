import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function calcularDiagnostico(respostas, materiaPorQuestao) {
  const totalCorretas = respostas.filter((r) => r.correta).length;
  const pontuacao = Math.round((totalCorretas / respostas.length) * 1000);

  const nivel =
    pontuacao >= 800
      ? "Avançado"
      : pontuacao >= 600
      ? "Intermediário"
      : pontuacao >= 400
      ? "Básico"
      : "Iniciante";

  const acertosPorMateria = {};

  respostas.forEach((r) => {
    const materia = materiaPorQuestao[r.questaoId];
    if (!materia) return;
    if (!acertosPorMateria[materia]) acertosPorMateria[materia] = { acertos: 0, total: 0 };
    acertosPorMateria[materia].total++;
    if (r.correta) acertosPorMateria[materia].acertos++;
  });

  const taxasPorMateria = Object.entries(acertosPorMateria).map(([m, v]) => ({
    materia: m,
    taxa: v.total > 0 ? v.acertos / v.total : 0,
  }));

  taxasPorMateria.sort((a, b) => b.taxa - a.taxa);

  const pontosFortes = taxasPorMateria.slice(0, 2).map((m) => m.materia);
  const pontosFracos = taxasPorMateria.slice(-2).map((m) => m.materia);

  return { pontuacao, nivel, pontosFortes, pontosFracos };
}

export function getMateriaColor(materia) {
  const map = {
    Matemática: "bg-brand-50 text-brand-600",
    Português: "bg-success-50 text-success-600",
    História: "bg-pink-50 text-pink-600",
    Geografia: "bg-amber-50 text-amber-600",
    Biologia: "bg-success-50 text-success-500",
    Física: "bg-brand-50 text-brand-500",
    Química: "bg-purple-50 text-purple-600",
    Redação: "bg-amber-50 text-amber-600",
  };
  return map[materia] ?? "bg-gray-100 text-gray-600";
}

export function getDificuldadeColor(d) {
  if (d === "Fácil") return "bg-success-50 text-success-600";
  if (d === "Médio") return "bg-amber-50 text-amber-600";
  return "bg-danger-50 text-danger-600";
}
