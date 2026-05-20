import { NextResponse } from "next/server";
import { gerarTexto, SYSTEM_PROMPTS } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { texto, tema, prova } = await req.json();

    if (!texto || !tema || !prova) {
      return NextResponse.json(
        { error: "Parâmetros inválidos: texto, tema e prova são obrigatórios." },
        { status: 400 }
      );
    }

    if (texto.trim().split(/\s+/).length < 50) {
      return NextResponse.json(
        { error: "Redação muito curta. Escreva pelo menos 50 palavras." },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS.corrigirRedacao(prova);
    const userPrompt = `Tema: ${tema}\n\nRedação:\n${texto}`;

    const rawText = await gerarTexto(systemPrompt, userPrompt);

    // Remove possíveis backticks/markdown do Gemini
    const clean = rawText.replace(/```json|```/g, "").trim();
    const correcao = JSON.parse(clean);

    return NextResponse.json({ correcao });
  } catch (err) {
    console.error("[corrigir-redacao]", err);
    return NextResponse.json(
      { error: "Erro ao corrigir redação. Tente novamente." },
      { status: 500 }
    );
  }
}
