import { NextResponse } from "next/server";
import { CURRICULO, PESO_MATERIA } from "@/lib/curriculo";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dias da semana disponíveis (segunda a sábado) — índices 1 a 6 (0 = domingo, pulamos)
const DIAS_SEMANA = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// Mapeia nome do dia para offset (segunda=1, terça=2... sábado=6 dentro da semana)
const DIA_OFFSET = {
  "segunda": 1,
  "terça":   2,
  "quarta":  3,
  "quinta":  4,
  "sexta":   5,
  "sábado":  6,
};

// Distribui matérias nos dias com base nos pontos fracos do aluno
function distribuirMaterias(pontosFracos, pontosFortes, diasAteEnem) {
  const semanas = Math.ceil(diasAteEnem / 7);
  const plano = [];

  // Calcula peso de cada matéria (mais peso = mais dias)
  const pesos = {};
  const todasMaterias = Object.keys(CURRICULO);

  todasMaterias.forEach((m) => {
    let peso = PESO_MATERIA[m] ?? 5;
    if (pontosFracos.includes(m)) peso *= 1.8;  // 80% mais dias para pontos fracos
    if (pontosFortes.includes(m)) peso *= 0.6;  // 40% menos dias para pontos fortes
    pesos[m] = peso;
  });

  // Rastreia progresso em cada matéria
  const progressoTopico = {};
  todasMaterias.forEach((m) => { progressoTopico[m] = 0; });

  // Gera o plano semana a semana
  for (let semana = 0; semana < semanas; semana++) {
    const semanaPlano = {
      semana: semana + 1,
      semanaIndex: semana, // ← índice 0-based para cálculo de datas
      dias: [],
    };

    // Seleciona matérias prioritárias para esta semana
    const materiasPrioritarias = todasMaterias
      .filter((m) => progressoTopico[m] < (CURRICULO[m]?.length ?? 0))
      .sort((a, b) => {
        const pesoA = pesos[a] * (pontosFracos.includes(a) ? 2 : 1);
        const pesoB = pesos[b] * (pontosFracos.includes(b) ? 2 : 1);
        return pesoB - pesoA;
      });

    // Distribui matérias nos 6 dias da semana
    DIAS_SEMANA.forEach((dia, idxDia) => {
      const tarefasDia = [];

      // Pega 2 matérias para o dia (variando para não repetir todo dia)
      const idxBase = (idxDia * 2) % materiasPrioritarias.length;
      const materiasDia = [
        materiasPrioritarias[idxBase % materiasPrioritarias.length],
        materiasPrioritarias[(idxBase + 1) % materiasPrioritarias.length],
      ].filter(Boolean);

      // Para cada matéria do dia, pega 1 tópico da sequência
      materiasDia.forEach((materia) => {
        const topicos = CURRICULO[materia] ?? [];
        const idxTopico = progressoTopico[materia];

        if (idxTopico < topicos.length) {
          tarefasDia.push({
            materia,
            topico:       topicos[idxTopico],
            indiceTopico: idxTopico,
            duracao_min:  materia === "Redação" ? 60 : 45,
            status:       "pendente",
            // ← Guarda o offset de dia: semana * 7 + offset do dia na semana
            diaOffset: semana * 7 + DIA_OFFSET[dia],
          });
          progressoTopico[materia]++;
        }
      });

      if (tarefasDia.length > 0) {
        semanaPlano.dias.push({ dia, tarefas: tarefasDia });
      }
    });

    plano.push(semanaPlano);
  }

  return plano;
}

function calcularData(dataBase, diasOffset) {
  const d = new Date(dataBase + "T00:00:00");
  d.setDate(d.getDate() + diasOffset);
  return d.toISOString().split("T")[0];
}

function calcularDiasAteEnem() {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const enem = new Date(ano, 10, 8); // novembro = mês 10
  if (enem < hoje) enem.setFullYear(ano + 1);
  return Math.ceil((enem - hoje) / (1000 * 60 * 60 * 24));
}

export async function POST(req) {
  try {
    const { usuarioId, pontosFracos = [], pontosFortes = [] } = await req.json();

    if (!usuarioId) {
      return NextResponse.json(
        { error: "usuarioId é obrigatório." },
        { status: 400 }
      );
    }

    // Calcula dias até o ENEM
    const diasAteEnem = calcularDiasAteEnem();

    // Gera o plano distribuído
    const planoGerado = distribuirMaterias(pontosFracos, pontosFortes, diasAteEnem);

    console.log("--- DEBUG DA GERAÇÃO ---");
    console.log("Total de matérias no CURRICULO:", Object.keys(CURRICULO).length);
    console.log("Semanas geradas:", planoGerado.length);
    console.log("Dias até o ENEM:", diasAteEnem);

    const dataBase = new Date().toISOString().split("T")[0];

    // Salva o plano no banco
    const { data: planoSalvo, error: planoError } = await supabaseAdmin
      .from("plano_estudo")
      .insert({
        usuario_id:  usuarioId,
        prova_id:    null,
        data_inicio: dataBase,
        data_prova:  calcularData(dataBase, diasAteEnem),
      })
      .select()
      .single();

    if (planoError) throw planoError;

    // Busca IDs das matérias
    const { data: materiasDB } = await supabaseAdmin
      .from("materia")
      .select("id, nome");

    const materiaMap = {};
    materiasDB?.forEach((m) => { materiaMap[m.nome] = m.id; });

    // Monta tarefas usando o diaOffset correto (calculado por semana + dia)
    const tarefasComId = [];

    planoGerado.forEach((semana) => {
      semana.dias.forEach((diaPlano) => {
        diaPlano.tarefas.forEach((tarefa) => {
          // ← CORREÇÃO: usa tarefa.diaOffset que já tem semana * 7 + dia correto
          const dataPrevista = calcularData(dataBase, tarefa.diaOffset);

          tarefasComId.push({
            plano_id:      planoSalvo.id,
            materia_id:    materiaMap[tarefa.materia] ?? null,
            titulo:        tarefa.topico,
            duracao_min:   tarefa.duracao_min,
            data_prevista: dataPrevista,
            status:        tarefa.status,
          });
        });
      });
    });

    console.log("Total de tarefas a salvar:", tarefasComId.length);
    if (tarefasComId.length > 0) {
      console.log("Primeira tarefa:", tarefasComId[0]);
      console.log("Última tarefa:", tarefasComId[tarefasComId.length - 1]);
    }

    // Insere tarefas em batch (lotes de 100)
    for (let i = 0; i < tarefasComId.length; i += 100) {
      const lote = tarefasComId.slice(i, i + 100);
      const { error: erroInsert } = await supabaseAdmin.from("tarefa").insert(lote);

      if (erroInsert) {
        console.error("[ERRO NO SUPABASE AO SALVAR TAREFAS]:", erroInsert);
        throw new Error("Falha ao salvar as tarefas no banco de dados.");
      }
    }

    return NextResponse.json({
      planoId:    planoSalvo.id,
      semanas:    planoGerado.length,
      totalDias:  diasAteEnem,
      pontosFracos,
      pontosFortes,
      message:    "Plano gerado com sucesso!",
    });

  } catch (err) {
    console.error("[gerar-plano]", err);
    return NextResponse.json(
      { error: "Erro ao gerar plano de estudos." },
      { status: 500 }
    );
  }
}