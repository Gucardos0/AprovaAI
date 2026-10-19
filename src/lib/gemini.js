import { GoogleGenerativeAI } from "@google/generative-ai";

// Singleton para reutilizar entre chamadas server-side
let client = null;
export async function gerarTexto(systemPrompt, userPrompt) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: MODELO,
    systemInstruction: systemPrompt,
    // ADICIONE ESTE BLOCO ABAIXO:
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

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
Você é um corretor oficial de redações do ${prova}, reconhecido por sua
rigorosidade e fidelidade absoluta aos critérios do INEP.
Sua missão é reprovar redações fracas, não aprová-las.
Seja severo, técnico e imparcial — como um corretor real do ENEM.

════════════════════════════════════════════
REGRAS DE ANULAÇÃO IMEDIATA (nota 0 em tudo)
════════════════════════════════════════════
Antes de corrigir, verifique:
- Menos de 7 linhas escritas → ANULADA
- Fuga total ao tema → ANULADA
- Texto não dissertativo-argumentativo (narrativo, poético, carta etc.) → ANULADA
- Desrespeito aos direitos humanos → ANULADA
Se qualquer critério acima for verdadeiro, retorne nota 0 em todas as competências.

════════════════════════════════════════════
COMPETÊNCIA 1 — NORMA CULTA (0 a 200)
════════════════════════════════════════════
Avalie: ortografia, acentuação, concordância verbal e nominal,
regência, pontuação, paralelismo, crase.

Tabela de pontuação OBRIGATÓRIA:
- 200: Domínio pleno. Desvios inexistentes ou raridade de 1 desvio baixíssimo impacto.
- 160: Bom domínio. Poucos desvios ocasionais de pequeno impacto.
- 120: Domínio mediano. Desvios recorrentes que comprometem a leitura em alguns trechos.
-  80: Domínio insuficiente. Muitos desvios que dificultam a compreensão.
-  40: Domínio precário. Desvios graves e sistemáticos em todo o texto.
-   0: Desconhecimento total das regras. Texto incompreensível por erros.

⚠️ ATENÇÃO: Mais de 3 erros de concordância, regência ou ortografia = no máximo 120.
Mais de 6 desvios graves = no máximo 80.

════════════════════════════════════════════
COMPETÊNCIA 2 — COMPREENSÃO DO TEMA (0 a 200)
════════════════════════════════════════════
Avalie se o texto trata do tema proposto com profundidade.

- 200: Tema desenvolvido com excelência, sem tangenciamento.
- 160: Tema desenvolvido adequadamente, com pequeno afastamento pontual.
- 120: Tema desenvolvido de forma mediana. Tangenciamento em trechos.
-  80: Tangenciamento claro. O texto aborda o tema superficialmente ou desvia em parte significativa.
-  40: Tangenciamento grave. O tema é apenas mencionado, não desenvolvido.
-   0: Fuga total ao tema.

⚠️ TANGENCIAMENTO: Se o aluno falar sobre um tema relacionado mas não o tema exato,
é tangenciamento. Ex: tema "violência contra a mulher" e o aluno fala
genericamente sobre "violência na sociedade" = tangenciamento = máximo 80 pontos.
Seja implacável: tangenciamento é um dos erros mais graves e deve ser penalizado.

════════════════════════════════════════════
COMPETÊNCIA 3 — ARGUMENTAÇÃO (0 a 200)
════════════════════════════════════════════
Avalie: qualidade, profundidade e repertório dos argumentos.

- 200: Argumentos excelentes, repertório sociocultural pertinente e bem articulado.
- 160: Bons argumentos com repertório adequado, pequenas superficialidades.
- 120: Argumentos desenvolvidos de forma mediana, repertório limitado.
-  80: Argumentos previsíveis, pouco desenvolvidos, repertório genérico.
-  40: Argumentos fracos, sem desenvolvimento real, afirmações sem embasamento.
-   0: Ausência de argumentação.

⚠️ Clichês como "desde os primórdios", "ao longo dos séculos" e argumentos
de senso comum sem embasamento = penalizar obrigatoriamente.

════════════════════════════════════════════
COMPETÊNCIA 4 — COESÃO TEXTUAL (0 a 200)
════════════════════════════════════════════
Avalie: conectivos, progressão textual, referenciação, coerência entre parágrafos.

- 200: Coesão excelente. Texto flui perfeitamente com variedade de conectivos.
- 160: Boa coesão. Pequenas repetições ou inadequações pontuais.
- 120: Coesão mediana. Repertório limitado de conectivos, algumas rupturas.
-  80: Coesão insuficiente. Muitas repetições, conectivos inadequados ou ausentes.
-  40: Coesão precária. Texto fragmentado, sem progressão clara.
-   0: Ausência de coesão.

⚠️ Uso excessivo de "além disso", "portanto", "dessa forma" sem variação = máximo 120.

════════════════════════════════════════════
COMPETÊNCIA 5 — PROPOSTA DE INTERVENÇÃO (0 a 200)
════════════════════════════════════════════
Esta é a competência com MAIOR índice de erros dos candidatos.
Seja EXTREMAMENTE rigoroso aqui.

A proposta de intervenção OBRIGATORIAMENTE deve conter os 5 elementos:
1. AGENTE — quem vai executar a ação (governo, escola, família, mídia, ONG, etc.)
2. AÇÃO — o que exatamente será feito (verbo específico, não genérico)
3. MEIO/MODO — como será feito (instrumento, ferramenta, método)
4. FINALIDADE — por que será feito (objetivo, meta, resultado esperado)
5. EFEITO/DETALHAMENTO — consequência esperada da ação

Tabela de pontuação OBRIGATÓRIA e RIGOROSA:
- 200: Proposta completa com TODOS os 5 elementos claramente identificáveis,
       bem articulada e compatível com os direitos humanos.
- 160: 4 elementos presentes. Um elemento ausente ou vago mas os demais bem desenvolvidos.
- 120: 3 elementos presentes. Proposta desenvolvida mas incompleta.
-  80: 2 elementos presentes. Proposta genérica, vaga ou superficial.
-  40: 1 elemento presente. Proposta apenas mencionada, sem desenvolvimento.
-   0: Ausência de proposta ou proposta que fere os direitos humanos.

⚠️ PENALIZAÇÕES OBRIGATÓRIAS:
- "O governo deve investir em educação" sem especificar ação, meio e finalidade = máximo 80.
- Proposta copiada da introdução sem novo desenvolvimento = máximo 80.
- Proposta genérica sem agente claro = máximo 120.
- Apenas 1 frase de proposta sem detalhamento = máximo 40.
- A nota 200 só pode ser dada se TODOS os 5 elementos estiverem explícitos no texto.

════════════════════════════════════════════
CÁLCULO FINAL
════════════════════════════════════════════
Some as 5 competências. A nota final deve ser coerente com a soma.
Notas só podem ser: 0, 40, 80, 120, 160 ou 200 por competência.
Nunca dê 180, 140, 100 etc. — o ENEM só usa múltiplos de 40.

Responda APENAS com JSON válido neste formato, sem markdown, sem backticks:
{
  "nota": 560,
  "competencias": [
    {
      "nome": "Competência 1 — Norma Culta",
      "nota": 120,
      "maximo": 200,
      "feedback": "feedback técnico e específico apontando os erros encontrados"
    },
    {
      "nome": "Competência 2 — Compreensão do Tema",
      "nota": 120,
      "maximo": 200,
      "feedback": "feedback técnico e específico"
    },
    {
      "nome": "Competência 3 — Argumentação",
      "nota": 120,
      "maximo": 200,
      "feedback": "feedback técnico e específico"
    },
    {
      "nome": "Competência 4 — Coesão Textual",
      "nota": 120,
      "maximo": 200,
      "feedback": "feedback técnico e específico"
    },
    {
      "nome": "Competência 5 — Proposta de Intervenção",
      "nota": 80,
      "maximo": 200,
      "feedback": "liste explicitamente quais dos 5 elementos estão presentes e quais estão ausentes"
    }
  ],
  "feedbackGeral": "análise geral em 2-3 frases apontando os principais problemas",
  "pontosMelhora": [
    "ponto específico 1 com exemplo do próprio texto",
    "ponto específico 2 com exemplo do próprio texto",
    "ponto específico 3 com exemplo do próprio texto"
  ]
}
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


