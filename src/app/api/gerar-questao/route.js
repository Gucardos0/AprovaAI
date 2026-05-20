import { NextResponse } from "next/server";
import { gerarTexto, SYSTEM_PROMPTS } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { prova, materia, dificuldade } = await req.json();

    if (!prova || !materia || !dificuldade) {
      return NextResponse.json(
        { error: "Parâmetros inválidos: prova, materia e dificuldade são obrigatórios." },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS.gerarQuestao(prova, materia, dificuldade);
    const userPrompt = `Gere uma questão de ${materia} com dificuldade ${dificuldade} para o ${prova}.`;

    const rawText = await gerarTexto(systemPrompt, userPrompt);

    // Remove possíveis backticks/markdown do Gemini
    const clean = rawText.replace(/```json|```/g, "").trim();
    const questao = JSON.parse(clean);

    return NextResponse.json({ questao });
  } catch (err) {
    console.error("[gerar-questao]", err);
    return NextResponse.json(
      { error: "Erro ao gerar questão. Tente novamente." },
      { status: 500 }
    );
  }
}
