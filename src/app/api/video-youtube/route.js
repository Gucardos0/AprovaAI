import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "O campo url é obrigatório." },
        { status: 400 },
      );
    }

    // TODO: implementar a lógica de processamento de vídeo do YouTube.
    return NextResponse.json({
      message:
        "Rota de vídeo YouTube ativa. Implemente a lógica de extração aqui.",
      url,
    });
  } catch (err) {
    console.error("[video-youtube]", err);
    return NextResponse.json(
      { error: "Erro ao processar vídeo YouTube." },
      { status: 500 },
    );
  }
}
