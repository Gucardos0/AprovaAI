// Banco de questões para o nivelamento inicial (não usa IA para ser rápido)
export const QUESTOES_NIVELAMENTO = [
  {
    id: "niv-1",
    materia: "Matemática",
    dificuldade: "Médio",
    enunciado:
      "Em uma progressão aritmética, o primeiro termo é 3 e a razão é 5. Qual é o 8° termo desta progressão?",
    alternativas: [
      { letra: "A", texto: "33" },
      { letra: "B", texto: "35" },
      { letra: "C", texto: "38" },
      { letra: "D", texto: "40" },
      { letra: "E", texto: "43" },
    ],
    gabarito: "C",
    explicacao:
      "O enésimo termo de uma PA é dado por aₙ = a₁ + (n-1)·r. Então a₈ = 3 + (8-1)·5 = 3 + 35 = 38.",
  },
  {
    id: "niv-2",
    materia: "Português",
    dificuldade: "Médio",
    enunciado:
      'Assinale a alternativa em que a palavra "mesmo" está empregada corretamente como advérbio:',
    alternativas: [
      { letra: "A", texto: "Os mesmos alunos foram aprovados." },
      { letra: "B", texto: "Ela mesma resolveu o problema." },
      { letra: "C", texto: "Mesmo cansado, ele estudou." },
      { letra: "D", texto: "Comprei o mesmo livro duas vezes." },
      { letra: "E", texto: "Eles são os mesmos de sempre." },
    ],
    gabarito: "C",
    explicacao:
      'Em "Mesmo cansado, ele estudou", "mesmo" funciona como advérbio de concessão, sendo invariável. Nas demais, funciona como pronome ou adjetivo, concordando com o substantivo.',
  },
  {
    id: "niv-3",
    materia: "História",
    dificuldade: "Fácil",
    enunciado:
      "A Revolução Industrial teve início no século XVIII em qual país, sendo caracterizada pela substituição do trabalho artesanal pelo assalariado e uso de máquinas?",
    alternativas: [
      { letra: "A", texto: "França" },
      { letra: "B", texto: "Alemanha" },
      { letra: "C", texto: "Estados Unidos" },
      { letra: "D", texto: "Inglaterra" },
      { letra: "E", texto: "Holanda" },
    ],
    gabarito: "D",
    explicacao:
      "A Revolução Industrial iniciou-se na Inglaterra (Reino Unido) por volta de 1760, impulsionada por fatores como acúmulo de capital, disponibilidade de matérias-primas das colônias e tradição comercial burguesa.",
  },
  {
    id: "niv-4",
    materia: "Biologia",
    dificuldade: "Médio",
    enunciado: "Sobre a mitose, é CORRETO afirmar que:",
    alternativas: [
      { letra: "A", texto: "Ocorre apenas nas células reprodutivas." },
      { letra: "B", texto: "Resulta em células com metade do número de cromossomos." },
      { letra: "C", texto: "Produz duas células geneticamente idênticas à célula-mãe." },
      { letra: "D", texto: "É o processo responsável pela formação de gametas." },
      { letra: "E", texto: "Compreende duas divisões celulares sucessivas." },
    ],
    gabarito: "C",
    explicacao:
      "A mitose é uma divisão celular que resulta em duas células-filhas com o mesmo número de cromossomos e constituição genética idêntica à célula-mãe. É utilizada para crescimento e regeneração de tecidos.",
  },
  {
    id: "niv-5",
    materia: "Física",
    dificuldade: "Médio",
    enunciado:
      "Um carro parte do repouso e acelera uniformemente a 4 m/s². Qual é sua velocidade após 6 segundos?",
    alternativas: [
      { letra: "A", texto: "10 m/s" },
      { letra: "B", texto: "20 m/s" },
      { letra: "C", texto: "24 m/s" },
      { letra: "D", texto: "28 m/s" },
      { letra: "E", texto: "30 m/s" },
    ],
    gabarito: "C",
    explicacao:
      "Usando a equação de Torricelli para MRUV: v = v₀ + a·t = 0 + 4·6 = 24 m/s.",
  },
  {
    id: "niv-6",
    materia: "Química",
    dificuldade: "Fácil",
    enunciado: "O número de prótons de um elemento define seu:",
    alternativas: [
      { letra: "A", texto: "Número de massa" },
      { letra: "B", texto: "Número atômico" },
      { letra: "C", texto: "Número de nêutrons" },
      { letra: "D", texto: "Período na tabela periódica" },
      { letra: "E", texto: "Número de elétrons na última camada" },
    ],
    gabarito: "B",
    explicacao:
      "O número atômico (Z) é definido pelo número de prótons no núcleo do átomo. É ele que identifica unicamente cada elemento químico na tabela periódica.",
  },
];

export const MATERIA_POR_QUESTAO = Object.fromEntries(
  QUESTOES_NIVELAMENTO.map((q) => [q.id, q.materia])
);
