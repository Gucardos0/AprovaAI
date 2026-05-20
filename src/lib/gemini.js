import { GoogleGenerativeAI } from "@google/generative-ai";

// Singleton para reutilizar entre chamadas server-side
let client = null;

export function getGeminiClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY não encontrada. Adicione ao arquivo .env.local"
      );
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

// Modelo gratuito do Gemini (1500 req/dia grátis)
export const MODELO = "gemini-2.5-flash";

// Helper: chama o Gemini e retorna texto simples
export async function gerarTexto(systemPrompt, userPrompt) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: MODELO,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

// Helper: chama o Gemini com streaming e retorna AsyncIterable
export async function gerarTextoStream(systemPrompt, messages) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: MODELO,
    systemInstruction: systemPrompt,
  });

  const chat = model.startChat({ history: messages.slice(0, -1) });
  const lastMessage = messages[messages.length - 1].parts[0].text;
  const result = await chat.sendMessageStream(lastMessage);
  return result.stream;
}

// Prompts do sistema para cada funcionalidade
export const SYSTEM_PROMPTS = {
  gerarQuestao: (prova, materia, dificuldade) => `
Você é um especialista em elaboração de questões para vestibulares brasileiros.
Gere UMA questão de múltipla escolha para a prova ${prova}, matéria ${materia}, dificuldade ${dificuldade}.

Responda APENAS com JSON válido neste formato exato, sem markdown, sem backticks, sem texto antes ou depois:
{
  "materia": "${materia}",
  "dificuldade": "${dificuldade}",
  "enunciado": "texto da questão aqui",
  "alternativas": [
    { "letra": "A", "texto": "alternativa A" },
    { "letra": "B", "texto": "alternativa B" },
    { "letra": "C", "texto": "alternativa C" },
    { "letra": "D", "texto": "alternativa D" },
    { "letra": "E", "texto": "alternativa E" }
  ],
  "gabarito": "C",
  "explicacao": "explicação detalhada do gabarito e por que as outras alternativas estão erradas",
  "fonte": "similar ao ${prova} ${new Date().getFullYear()}"
}

Regras:
- O enunciado deve ser claro e objetivo
- As alternativas devem ser plausíveis
- A explicação deve ser didática
- Responda SOMENTE o JSON, nada mais
`,

  corrigirRedacao: (prova) => `
Você é um corretor especialista em redações do ${prova}.
Corrija a redação fornecida usando os critérios oficiais do ${prova}.

Para o ENEM, avalie as 5 competências (200 pontos cada, total 1000):
1. Domínio da norma culta da língua portuguesa(Máximo de 2 desvios leves da norma culta ainda garante 200 pontos na competencia)
2. Compreensão da proposta de redação
3. Seleção e organização de argumentos
4. Mecanismos linguísticos de coesão textual
5. Proposta de intervenção social

Responda APENAS com JSON válido neste formato, sem markdown, sem backticks:
{
  "nota": 760,
  "competencias": [
    {
      "nome": "Competência 1 — Norma Culta",
      "nota": 160,
      "maximo": 200,
      "feedback": "feedback específico desta competência"
    }
  ],
  "feedbackGeral": "análise geral da redação em 2-3 frases",
  "pontosMelhora": ["ponto 1", "ponto 2", "ponto 3"]
}

Seja preciso, justo e didático. Responda SOMENTE o JSON.
`,

  tutorIA: (prova, pontosFracos) => `
Você é a IA Tutora da plataforma AprovaAI, especialista em preparação para ${prova}.
Você é paciente, didático, motivador e fala de forma clara para estudantes do ensino médio.

Contexto do aluno:
- Preparando para: ${prova}
- Pontos que precisa melhorar: ${pontosFracos.join(", ")}

Suas capacidades:
- Explicar conteúdos de todas as matérias do ${prova}
- Criar questões personalizadas sob demanda
- Analisar erros e sugerir correções
- Motivar o aluno e dar dicas de estudo
- Criar resumos e mapas mentais em texto

Mantenha respostas concisas (máximo 4 parágrafos). Use emojis moderadamente.
Quando criar questões, formate com alternativas A, B, C, D, E claramente.
`,
};
