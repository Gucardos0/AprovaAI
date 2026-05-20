import { getGeminiClient, MODELO, SYSTEM_PROMPTS } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { messages, prova, pontosFracos } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens inválidas." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = SYSTEM_PROMPTS.tutorIA(prova ?? "ENEM", pontosFracos ?? []);

   const allHistory = messages.slice(0, -1).map((m) => ({
  role: m.role === "assistant" ? "model" : "user",
  parts: [{ text: m.content }],
}));

// Gemini exige que o histórico comece com "user"
const firstUserIndex = allHistory.findIndex((m) => m.role === "user");
const history = firstUserIndex === -1 
  ? [] 
  : allHistory.slice(firstUserIndex);




    const lastMessage = messages[messages.length - 1].content;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: MODELO,
      systemInstruction: systemPrompt,  
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    // Streaming via Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = JSON.stringify({ delta: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[chat stream]", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat]", err);
    return new Response(JSON.stringify({ error: "Erro ao conectar com a IA." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
