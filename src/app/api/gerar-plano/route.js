import { NextResponse } from "next/server";
import { CURRICULO, PESO_MATERIA } from "@/lib/curriculo";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dias da semana disponíveis (segunda a sábado)
const DIAS_SEMANA = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

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

  // Normaliza pesos para distribuição nos dias
  const totalPeso = Object.values(pesos).reduce((a, b) => a + b, 0);
  const diasPorMateria = {};
  todasMaterias.forEach((m) => {
    diasPorMateria[m] = Math.max(1, Math.round((pesos[m] / totalPeso) * semanas * 6));
  });

  // Rastreia progresso em cada matéria
  const progressoTopico = {};
  todasMaterias.forEach((m) => { progressoTopico[m] = 0; });

  // Gera o plano semana a semana
  for (let semana = 0; semana < semanas; semana++) {
    const semanaPlano = {
      semana: semana + 1,
      dataInicio: calcularData(new Date().toISOString().split("T")[0], semana * 7),
dataFim:    calcularData(new Date().toISOString().split("T")[0], semana * 7 + 6),
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
            topico:      topicos[idxTopico],
            indiceTopico: idxTopico,
            duracao_min: materia === "Redação" ? 60 : 45,
            status:      "pendente",
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
  const d = new Date(dataBase);
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

    

    
    // 3. Calcula dias até o ENEM
    const diasAteEnem = calcularDiasAteEnem();

    // 4. Gera o plano distribuído
    const planoGerado = distribuirMaterias(pontosFracos, pontosFortes, diasAteEnem);
    
   const dataBase = new Date().toISOString().split("T")[0];

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
      console.log("--- DEBUG DA GERAÇÃO ---");
    console.log("Total de matérias no CURRICULO:", Object.keys(CURRICULO).length);
    console.log("Semanas geradas:", planoGerado.length);


    if (planoError) throw planoError;

    // 6. Salva as tarefas semana a semana
    const tarefasParaSalvar = [];
let diaOffset = 0;

planoGerado.forEach((semana) => {
  semana.dias.forEach((diaPlano) => {
    diaPlano.tarefas.forEach((tarefa) => {
      tarefasParaSalvar.push({
        plano_id:      planoSalvo.id,
        materia_nome:  tarefa.materia,
        titulo:        tarefa.topico,
        duracao_min:   tarefa.duracao_min,
        data_prevista: calcularData(dataBase, diaOffset),
        status:        "pendente",
      });
    });
    diaOffset++;
  });
});

    // Busca IDs das matérias
    const { data: materiasDB } = await supabaseAdmin
      .from("materia")
      .select("id, nome");

    const materiaMap = {};
    materiasDB?.forEach((m) => { materiaMap[m.nome] = m.id; });

    // Insere tarefas em batch
    const tarefasComId = tarefasParaSalvar.map((t) => ({
      plano_id:     t.plano_id,
      materia_id:   materiaMap[t.materia_nome] ?? null,
      titulo:       t.titulo,
      duracao_min:  t.duracao_min,
      data_prevista: t.data_prevista,
      status:       t.status,
    }));

   for (let i = 0; i < tarefasComId.length; i += 100) {
      const lote = tarefasComId.slice(i, i + 100);
      
      const { error: erroInsert } = await supabaseAdmin.from("tarefa").insert(lote);
      
      // Se der erro ao salvar as tarefas, avisa o terminal e para tudo!
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
