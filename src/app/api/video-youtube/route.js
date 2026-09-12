import { NextResponse } from "next/server";

const QUERIES = {
  Matemática: "matemática ENEM vestibular aula",
  Português:  "português ENEM redação aula",
  História:   "história ENEM vestibular aula",
  Biologia:   "biologia ENEM vestibular aula",
  Física:     "física ENEM vestibular aula",
  Química:    "química ENEM vestibular aula",
  Redação:    "redação ENEM dissertação aula",
  Ciências:   "ciências natureza ENEM aula",
};

const CANAIS_CONFIAVEIS = [
  "UCe5dMscBFcODfKSoFHqUlQ",
  "UCBhEFuGKBuZLc-tWN2jBYIA",
  "UCpEbRDFnCWLNcVJrLK7MR1w",
  "UCh3Rpsdv1fxefE0ZcKBaNpQ",
  "UCiHMFAd3D7kWHMLPdQJOCsA",
  "UCnvbsOVFLyCLM8sMEkbPd4g",
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const materia = searchParams.get("materia") ?? "Matemática";
    const busca   = searchParams.get("busca")   ?? "";
    const max     = searchParams.get("max")      ?? "6";

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY não configurada." },
        { status: 500 }
      );
    }

    const query = busca.trim()
      ? `${busca} ENEM aula`
      : QUERIES[materia] ?? `${materia} ENEM aula`;

    const params = new URLSearchParams({
      part:              "snippet",
      q:                 query,
      type:              "video",
      videoCategoryId:   "27",
      relevanceLanguage: "pt",
      regionCode:        "BR",
      maxResults:        max,
      order:             "relevance",
      key:               apiKey,
    });

    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    if (!ytRes.ok) {
      const err = await ytRes.json();
      console.error("[youtube]", err);
      return NextResponse.json(
        { error: "Erro ao buscar vídeos no YouTube." },
        { status: 500 }
      );
    }

    const ytData = await ytRes.json();

    const videoIds = ytData.items
      .map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    const detailParams = new URLSearchParams({
      part: "contentDetails,statistics",
      id:   videoIds,
      key:  apiKey,
    });

    const detailRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${detailParams}`
    );
    const detailData = detailRes.ok ? await detailRes.json() : { items: [] };

    const duracaoMap = {};
    detailData.items?.forEach((item) => {
      const iso   = item.contentDetails?.duration ?? "";
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const h        = parseInt(match[1] ?? 0);
        const m        = parseInt(match[2] ?? 0);
        const s        = parseInt(match[3] ?? 0);
        const totalMin = h * 60 + m;
        duracaoMap[item.id] = `${totalMin}:${String(s).padStart(2, "0")}`;
      }
    });

    const videos = ytData.items
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        id:          item.id.videoId,
        titulo:      item.snippet.title,
        canal:       item.snippet.channelTitle,
        canalId:     item.snippet.channelId,
        thumbnail:   item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
        duracao:     duracaoMap[item.id.videoId] ?? "—",
        materia,
        recomendado: CANAIS_CONFIAVEIS.includes(item.snippet.channelId),
        publishedAt: item.snippet.publishedAt,
      }));

    return NextResponse.json({ videos, query });
  } catch (err) {
    console.error("[youtube]", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar vídeos." },
      { status: 500 }
    );
  }
}