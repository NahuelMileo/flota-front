import type { Tone } from "./demo-data"

// Textos y datos de demostración de la landing, uno por país. Los dos
// objetos tienen la misma forma: el diseño es único y solo cambia esto.
// Los montos de Uruguay son los de Brasil pasados a pesos (≈ 7,3 por real).

export type Locale = "pt" | "es"

export type DemoTruck = {
  plate: string
  inc: string
  cost: string
  gain: string
  g: number
  status: string
  tone: Tone
}

// [monto, cobrado]
export type Flete = {
  client: string
  truck: string
  a: [number, boolean]
  s: [number, boolean]
  p: [number, boolean]
  // El saldo que la demo marca como cobrado.
  target?: boolean
}

// [texto normal, texto destacado, texto normal]
type Emphasis = [string, string, string]

export type Content = {
  lang: string
  currency: string
  whatsappText: string
  nav: { links: [string, string][]; home: string; openMenu: string; closeMenu: string; demo: string; whatsapp: string; footer: string }
  hero: {
    lines: [string, string]
    sub: string
    whatsapp: string
    bullets: [string, string, string]
    sr: string
    sidebar: string[]
    activeItem: string
    alertItem: string
    title: string
    month: string
    billed: string
    costs: string
    profit: string
    /** Encabezado del balance del mockup ("Ganancia de setiembre"). */
    profitTitle: string
    marginLabel: string
    cols: [string, string, string, string, string]
    toast: Emphasis
    demoTag: string
  }
  /** Escena fijada "Cargás una vez": viaje → flete → gasoil → ganancia. */
  journey: {
    eyebrow: string
    title: string
    lead: string
    sr: string
    steps: [string, string][]
    window: string
    route: string
    odoLabel: string
    odoFrom: number
    km: number
    tripKm: string
    /** [concepto, monto, ingreso o egreso, paso en que aparece, se carga solo] */
    rows: [string, number, "in" | "out", number, boolean][]
    autoTag: string
    result: string
    perKm: string
  }
  summary: { billed: number; costs: number; profit: number }
  trucks: DemoTruck[]
  problem: {
    title: string
    sheetName: string
    sheetHead: [string, string, string, string]
    sheetRows: [string, string, string, string][]
    chatName: string
    chat: [string, string, string]
    dashLabel: string
    ticket: { station: string; fuel: string; liters: string; total: string; thanks: string }
    notebook: [string, string, string]
    calc: string
    winSaldo: [string, string]
    winFuel: [string, string]
    steps: [string, string, string, string]
  }
  cuentas: {
    eyebrow: string
    title: string
    lead: string
    sr: string
    owedLabel: string
    period: string
    cols: [string, string, string, string, string]
    pending: string
    paid: string
    of: string
  }
  fletes: Flete[]
  lucro: {
    eyebrow: string
    title: string
    lead: string
    sr: string
    card: string
    unit: string
    low: string
    inc: string
    cost: string
    gain: string
    hint: string
  }
  avisos: {
    eyebrow: string
    title: string
    lead: string
    sr: string
    month: string
    dueDates: string
    weekdays: string[]
    alertsTitle: string
    /** El primer aviso (cambio de aceite) lo maneja el odómetro de la demo. */
    alerts: { label: string; plate: string; when: string; urgent: boolean }[]
    odo: { title: string; serviceAt: number; from: number; to: number; left: string; over: string; every: string }
  }
  bento: {
    title: string
    fuel: { title: string; text: string; slices: [string, string, string, string]; kml: string }
    money: { title: string; text: string; group: string; options: [string, string][]; profitLabel: string; tag: string }
    fixed: { title: string; text: string; months: string[]; installment: string; fixed: string; span: string }
    chat: { title: string; text: string; question: string; answer: string }
    salary: { title: string; text: string; freight: string; freightValue: string; driver: string; expense: string; expenseValue: number }
    team: { title: string; text: string; copy: string; copied: string; copyLabel: string }
  }
  compare: {
    title: string
    aria: string
    no: string
    yes: string
    rows: string[]
    asideEyebrow: string
    asideTitle: string
    aside: Emphasis[]
  }
  steps: { title: string; items: [string, string][] }
  security: { title: string; items: [string, string][] }
  pricing: { title: string; text: string; question: string; cta: (fleet: string) => string; includedTitle: string; included: string[] }
  faq: { title: string; lead: [string, string]; items: [string, string][] }
  cta: { lines: [string, string]; text: string }
  dialog: {
    title: string
    text: string
    name: string
    company: string
    trucks: string
    phone: string
    phonePlaceholder: string
    submit: string
    subject: string
    bodyLabels: [string, string, string, string]
    sentTitle: string
    sentText: string
    close: string
  }
}

const PT: Content = {
  lang: "pt-BR",
  currency: "R$",
  whatsappText: "Olá, quero ver uma demonstração do Kilometría.",
  nav: {
    links: [
      ["#como-funciona", "Como funciona"],
      ["#beneficios", "Benefícios"],
      ["#precio", "Preço"],
      ["#preguntas", "Perguntas"],
    ],
    home: "Kilometría, início",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    demo: "Quero ver uma demonstração",
    whatsapp: "Fale pelo WhatsApp",
    footer: "Rodapé",
  },
  hero: {
    lines: ["Saiba quanto cada", "caminhão te dá de lucro."],
    sub: "Fretes, adiantamentos, saldos, pedágios e despesas em um só lugar. Sem planilha nem papelzinho, em real, peso ou dólar.",
    whatsapp: "Fale pelo WhatsApp",
    bullets: ["Sem instalar nada", "Funciona no celular", "Seus dados, só você vê"],
    sr: "Exemplo da tela do Kilometría com dados de demonstração: em setembro foram faturados 198.420 reais, com 147.880 de custos e 50.540 de lucro. O caminhão IKG dá 2,02 reais por quilômetro, o IWV 0,27 com margem baixa, o JRT 1,32 e o HXR 1,23. Um alerta indica que o seguro do IKG vence em 7 dias.",
    sidebar: ["Viagens", "Caminhões", "Manutenções", "Vencimentos", "Contas a Receber", "Receitas", "Despesas"],
    activeItem: "Caminhões",
    alertItem: "Vencimentos",
    title: "Resumo dos caminhões",
    month: "Setembro 2026",
    billed: "Faturado",
    costs: "Custos",
    profit: "Lucro",
    profitTitle: "Lucro de setembro",
    marginLabel: "de margem",
    cols: ["Placa", "Receita/km", "Custo/km", "Lucro/km", "Status"],
    toast: ["O seguro do ", "IKG", " vence em 7 dias"],
    demoTag: "Dados de demonstração",
  },
  journey: {
    eyebrow: "Como funciona",
    title: "Você lança uma vez. Tudo se atualiza.",
    lead: "Cada dado que você lança alimenta os outros: a viagem move o odômetro, o frete gera a comissão do motorista e o diesel entra no custo por km.",
    sr: "Demonstração: uma viagem Porto Alegre → São Paulo de 1.110 km. O frete de 12.000 reais gera sozinho a comissão do motorista de 1.800. Com diesel de 2.598 e pedágios de 480, o lucro da viagem é de 7.122 reais, 6,42 por quilômetro.",
    steps: [
      ["Você lança a viagem", "Os km da viagem atualizam o odômetro do caminhão."],
      ["Você lança o frete", "A comissão do motorista é registrada sozinha: 15 % do frete por padrão, ou o percentual que você definir."],
      ["Você lança o diesel e os pedágios", "Com os litros e os km, para saber quanto custa cada quilômetro."],
      ["Você sabe quanto lucrou", "O lucro da viagem e do caminhão, também por quilômetro."],
    ],
    window: "Viagem · IKG",
    route: "Porto Alegre → São Paulo",
    odoLabel: "Odômetro",
    odoFrom: 412150,
    km: 1110,
    tripKm: "km da viagem",
    rows: [
      ["Frete · Agro Paraná", 12000, "in", 1, false],
      ["Comissão do motorista · 15 %", 1800, "out", 1, true],
      ["Diesel · 412,6 L", 2598, "out", 2, false],
      ["Pedágios", 480, "out", 2, false],
    ],
    autoTag: "automático",
    result: "Lucro da viagem",
    perKm: "por km",
  },
  summary: { billed: 198420, costs: 147880, profit: 50540 },
  trucks: [
    { plate: "IKG", inc: "5,70", cost: "3,68", gain: "2,02", g: 2.02, status: "Rentável", tone: "green" },
    { plate: "IWV", inc: "5,05", cost: "4,78", gain: "0,27", g: 0.27, status: "Margem baixa", tone: "amber" },
    { plate: "JRT", inc: "5,42", cost: "4,10", gain: "1,32", g: 1.32, status: "Estável", tone: "neutral" },
    { plate: "HXR", inc: "5,18", cost: "3,95", gain: "1,23", g: 1.23, status: "Estável", tone: "neutral" },
  ],
  problem: {
    title: "Hoje sua empresa está espalhada em seis lugares.",
    sheetName: "fretes_set_FINAL(2).xlsx",
    sheetHead: ["Cliente", "Adiant.", "Saldo", "¿?"],
    sheetRows: [
      ["Agro P.", "12830", "5500", ""],
      ["Frig. S", "7700", "3300", "ver"],
      ["Coop N", "4200", "1800", "#REF!"],
    ],
    chatName: "Sócio",
    chat: ["Me manda o do pedágio", "e o cupom do diesel de ontem", "mando à noite"],
    dashLabel: "foto_painel.jpg · km",
    ticket: { station: "POSTO BR-116", fuel: "DIESEL S10", liters: "412,6 L", total: "R$ 2.598", thanks: "obrigado" },
    notebook: ["IWV — saldo ??", "Agro P. deve 5.500", "pneus → março"],
    calc: "147.880",
    winSaldo: ["Agro Paraná · saldo", "R$ 5.500"],
    winFuel: ["Diesel · IKG", "3,1 km/L"],
    steps: [
      "Os saldos ficam anotados numa planilha.",
      "As despesas chegam pelo WhatsApp.",
      "E no fim do mês ninguém sabe quanto lucrou.",
      "O Kilometría junta tudo.",
    ],
  },
  cuentas: {
    eyebrow: "Cobrança",
    title: "Nenhum saldo fica para trás.",
    lead: "Cada frete com seu adiantamento, seu saldo e seu pedágio. Você marca o que recebeu com um clique e a receita é lançada sozinha. Em segundos você sabe quem te deve e quanto.",
    sr: "Demonstração: ao rolar, os saldos e adiantamentos pendentes de quatro fretes passam para recebidos um por um e o total a receber cai de 18.400 para 1.800 reais.",
    owedLabel: "Falta receber",
    period: "4 fretes · Setembro",
    cols: ["Cliente", "Caminhão", "Adiantamento", "Saldo", "Pedágio"],
    pending: "Pendente",
    paid: "Recebido",
    of: "de",
  },
  fletes: [
    { client: "Transportes Serra Gaúcha", truck: "IKG", a: [8400, true], s: [3600, false], p: [620, true] },
    { client: "Agro Paraná", truck: "IWV", a: [12830, true], s: [5500, false], p: [480, true], target: true },
    { client: "Frigorífico Sul", truck: "JRT", a: [7700, true], s: [3300, false], p: [540, true] },
    { client: "Cooperativa Grãos do Norte", truck: "HXR", a: [4200, false], s: [1800, false], p: [360, true] },
  ],
  lucro: {
    eyebrow: "Rentabilidade",
    title: "Veja qual caminhão dá lucro e qual come o seu dinheiro.",
    lead: "Receita, custo e lucro por quilômetro de cada caminhão, com seguro, IPVA e parcelas incluídos. O lucro que você vê é o real.",
    sr: "Demonstração: lucro por quilômetro de quatro caminhões. IKG 2,02 reais, JRT 1,32, HXR 1,23 e IWV 0,27, marcado com margem baixa.",
    card: "Lucro por km",
    unit: "R$/km · Setembro",
    low: "Margem baixa",
    inc: "Receita/km",
    cost: "Custo/km",
    gain: "Lucro/km",
    hint: "Passe o mouse ou toque em um caminhão para ver o detalhamento",
  },
  avisos: {
    eyebrow: "Tranquilidade",
    title: "Avisa antes de quebrar ou vencer.",
    lead: "Seguro, RNTRC, licenciamento e os vencimentos que você criar: alerta uma semana antes e no dia anterior. E cada revisão por km ou por data, para não descobrir na estrada.",
    sr: "Demonstração: o odômetro do HXR sobe até passar da troca de óleo, marcada para os 412.000 km, e o alerta muda de pendente para vencido. Ao lado, um calendário de outubro com vencimentos: o RNTRC do JRT vence amanhã e o seguro do IKG em 7 dias.",
    month: "Outubro 2026",
    dueDates: "Vencimentos",
    weekdays: ["S", "T", "Q", "Q", "S", "S", "D"],
    alertsTitle: "Alertas",
    alerts: [
      { label: "Troca de óleo", plate: "HXR", when: "faltam 800 km", urgent: false },
      { label: "RNTRC", plate: "JRT", when: "vence amanhã", urgent: true },
      { label: "Seguro", plate: "IKG", when: "vence em 7 dias", urgent: false },
    ],
    odo: { title: "Odômetro · HXR", serviceAt: 412000, from: 411200, to: 412040, left: "faltam", over: "passou da troca", every: "Troca de óleo a cada 20.000 km" },
  },
  bento: {
    title: "E todo o resto, também.",
    fuel: {
      title: "Diesel sob controle",
      text: "Despesas por categoria e km por litro de cada viagem.",
      slices: ["Diesel", "Pedágios", "Pneus", "Outros"],
      kml: "km/L · última viagem",
    },
    money: {
      title: "Real, peso e dólar",
      text: "Cada despesa na sua moeda e o resultado na que você escolher.",
      group: "Moeda de exemplo",
      options: [
        ["R$", "R$ 50.540"],
        ["$", "$ 369.440"],
        ["US$", "US$ 9.190"],
      ],
      profitLabel: "Lucro de setembro",
      tag: "Dados de demonstração · cotação de exemplo",
    },
    fixed: {
      title: "Custos fixos e parcelas",
      text: "Você lança a parcela uma vez e ela se distribui sozinha todo mês.",
      months: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      installment: "Parcela",
      fixed: "Custos fixos",
      span: "12 meses",
    },
    chat: {
      title: "Pergunte ao ChatGPT ou ao Claude",
      text: "“Quanto gastei de pedágio em agosto?” e ele responde com os seus dados. Só leitura, e você desconecta quando quiser.",
      question: "Quanto gastei de pedágio em agosto?",
      answer: "Em agosto você gastou R$ 6.840 em pedágios, em 14 viagens. O que mais gastou foi o IKG.",
    },
    salary: {
      title: "Salário do motorista",
      text: "Você define o % e a despesa é calculada sozinha.",
      freight: "Frete",
      freightValue: "R$ 12.000",
      driver: "Motorista",
      expense: "Despesa",
      expenseValue: 2160,
    },
    team: {
      title: "Trabalhe em equipe",
      text: "Convide sua equipe do escritório ou seu sócio com um código.",
      copy: "Copiar",
      copied: "Copiado",
      copyLabel: "Copiar código de exemplo",
    },
  },
  compare: {
    title: "O que uma planilha não faz.",
    aria: "Comparação entre Excel e Kilometría",
    no: "Não",
    yes: "Sim",
    rows: [
      "Avisa antes de um vencimento.",
      "Receber um saldo atualiza suas receitas.",
      "Soma as parcelas e os custos fixos do mês.",
      "Várias pessoas usam ao mesmo tempo, pelo celular.",
      "Real, peso e dólar com a cotação do dia.",
    ],
    asideEyebrow: "Transporte",
    asideTitle: "Feito para o transportador.",
    aside: [
      ["Vencimentos que vêm prontos — ", "seguro, RNTRC, licenciamento", " — e você cria os que precisar conforme sua rota e os países onde opera."],
      ["Pensado para fretes no ", "Mercosul", ", com real, peso e dólar."],
      ["O vocabulário do seu escritório: ", "frete, adiantamento, saldo, pedágio", "."],
    ],
  },
  steps: {
    title: "Como começar.",
    items: [
      ["Agendamos uma demonstração", "com os seus números, não com números de exemplo."],
      ["Cadastramos seus caminhões", "seus clientes e seus vencimentos."],
      ["Você começa a ver", "quanto cada caminhão te dá de lucro."],
    ],
  },
  security: {
    title: "Seus números, protegidos.",
    items: [
      ["Seus dados são seus.", "Cada empresa vê só o que é seu, separado no banco de dados."],
      ["Acesso protegido.", "Sessões seguras e proteção contra tentativas de acesso repetidas."],
      ["Você pode sair quando quiser.", "Você exporta tudo em CSV quando quiser."],
    ],
  },
  pricing: {
    title: "Você paga pelos caminhões que tem.",
    text: "Uma mensalidade base e um valor mensal por caminhão. Se você tem poucos caminhões, paga pouco.",
    question: "Quantos caminhões você tem?",
    cta: (fleet) => `Consulte o preço para ${fleet} caminhões`,
    includedTitle: "Incluído em todos os planos",
    included: [
      "Contas a receber com adiantamento, saldo e pedágio",
      "Lucro por quilômetro de cada caminhão",
      "Alertas de manutenção e vencimentos",
      "Viagens, despesas por categoria e consumo de diesel",
      "Custos fixos, parcelas e salário do motorista",
      "Real, peso e dólar com cotação automática",
      "Usuários para sua equipe",
      "Conexão com ChatGPT ou Claude, e exportação em CSV",
    ],
  },
  faq: {
    title: "Perguntas frequentes.",
    lead: ["Ficou alguma dúvida? ", "Fale com a gente pelo WhatsApp"],
    items: [
      ["Preciso entender de computador?", "Não. Funciona como o WhatsApp: pelo celular, com botões grandes. E você pode convidar quem te ajuda."],
      ["Serve se eu tenho poucos caminhões?", "Sim. Você paga por caminhão, então o preço acompanha o tamanho da sua frota."],
      ["Meus dados estão seguros?", "Cada empresa vê só os seus dados. Ninguém mais, nem outra empresa do sistema, pode vê-los."],
      ["Funciona com real, peso e dólar?", "Sim, com a cotação do dia."],
      ["E o que eu tenho no Excel?", "Vemos juntos na demonstração e ajudamos você a passar tudo. E quando quiser, exporta tudo."],
      ["E se eu vender um caminhão?", "Você dá baixa e não perde o que ele faturou nem o que gastou."],
      ["Preciso instalar alguma coisa?", "Não. Você acessa pelo navegador."],
    ],
  },
  cta: { lines: ["Organize sua empresa", "este mês."], text: "Mostramos o Kilometría com os seus caminhões e os seus números." },
  dialog: {
    title: "Quero ver uma demonstração",
    text: "Entramos em contato para combinar uma demonstração com os seus números.",
    name: "Nome",
    company: "Empresa",
    trucks: "Quantidade de caminhões",
    phone: "Telefone",
    phonePlaceholder: "(11) 9XXXX-XXXX",
    submit: "Enviar",
    subject: "Demonstração Kilometría",
    bodyLabels: ["Nome", "Empresa", "Caminhões", "Telefone"],
    sentTitle: "Pronto!",
    sentText: "Seu e-mail abriu com os dados preenchidos. É só enviar e entramos em contato para combinar a demonstração.",
    close: "Fechar",
  },
}

const ES: Content = {
  lang: "es-UY",
  currency: "$",
  whatsappText: "Hola, quiero ver una demostración de Kilometría.",
  nav: {
    links: [
      ["#como-funciona", "Cómo funciona"],
      ["#beneficios", "Beneficios"],
      ["#precio", "Precio"],
      ["#preguntas", "Preguntas"],
    ],
    home: "Kilometría, inicio",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    demo: "Quiero ver una demostración",
    whatsapp: "Hablanos por WhatsApp",
    footer: "Pie de página",
  },
  hero: {
    lines: ["Sabé cuánto te deja", "cada camión."],
    sub: "Fletes, adelantos, saldos, peajes y gastos en un solo lugar. Sin planillas ni papelitos, en pesos, reales o dólares.",
    whatsapp: "Hablanos por WhatsApp",
    bullets: ["Sin instalar nada", "Funciona en el celular", "Tus datos, solo los ves vos"],
    sr: "Ejemplo de la pantalla de Kilometría con datos de demostración: en setiembre se facturaron 1.450.440 pesos, con 1.081.000 de costos y 369.440 de ganancia. El camión SBX deja 14,80 pesos por kilómetro, el RAF 2,00 con margen bajo, el TMC 9,60 y el LQB 9,00. Un aviso indica que el seguro del SBX vence en 7 días.",
    sidebar: ["Viajes", "Camiones", "Mantenimientos", "Vencimientos", "Cuentas a Recibir", "Ingresos", "Egresos"],
    activeItem: "Camiones",
    alertItem: "Vencimientos",
    title: "Resumen de camiones",
    month: "Setiembre 2026",
    billed: "Facturado",
    costs: "Costos",
    profit: "Ganancia",
    profitTitle: "Ganancia de setiembre",
    marginLabel: "de margen",
    cols: ["Matrícula", "Ingreso/km", "Costo/km", "Ganancia/km", "Estado"],
    toast: ["El seguro del ", "SBX", " vence en 7 días"],
    demoTag: "Datos de demostración",
  },
  journey: {
    eyebrow: "Cómo funciona",
    title: "Cargás una vez. Se actualiza todo.",
    lead: "Cada dato que cargás alimenta a los demás: el viaje mueve el odómetro, el flete genera la comisión del chofer y el gasoil entra en el costo por km.",
    sr: "Demostración: un viaje Montevideo → São Paulo de 2.010 km. El flete de 90.000 pesos genera solo la comisión del chofer de 13.500. Con gasoil de 19.800 y peajes de 3.500, la ganancia del viaje es de 53.200 pesos, 26,47 por kilómetro.",
    steps: [
      ["Cargás el viaje", "Los km del viaje actualizan el odómetro del camión."],
      ["Cargás el flete", "La comisión del chofer se registra sola: 15 % del flete por defecto, o el porcentaje que definas."],
      ["Cargás el gasoil y los peajes", "Con los litros y los km, para saber cuánto te cuesta cada kilómetro."],
      ["Sabés cuánto te dejó", "La ganancia del viaje y del camión, también por kilómetro."],
    ],
    window: "Viaje · SBX",
    route: "Montevideo → São Paulo",
    odoLabel: "Odómetro",
    odoFrom: 412150,
    km: 2010,
    tripKm: "km del viaje",
    rows: [
      ["Flete · Agro Litoral", 90000, "in", 1, false],
      ["Comisión del chofer · 15 %", 13500, "out", 1, true],
      ["Gasoil · 412,6 L", 19800, "out", 2, false],
      ["Peajes", 3500, "out", 2, false],
    ],
    autoTag: "automático",
    result: "Ganancia del viaje",
    perKm: "por km",
  },
  summary: { billed: 1450440, costs: 1081000, profit: 369440 },
  trucks: [
    { plate: "SBX", inc: "41,70", cost: "26,90", gain: "14,80", g: 14.8, status: "Rentable", tone: "green" },
    { plate: "RAF", inc: "36,90", cost: "34,90", gain: "2,00", g: 2, status: "Margen bajo", tone: "amber" },
    { plate: "TMC", inc: "39,60", cost: "30,00", gain: "9,60", g: 9.6, status: "Estable", tone: "neutral" },
    { plate: "LQB", inc: "37,90", cost: "28,90", gain: "9,00", g: 9, status: "Estable", tone: "neutral" },
  ],
  problem: {
    title: "Hoy tu empresa está repartida en seis lugares.",
    sheetName: "fletes_set_FINAL(2).xlsx",
    sheetHead: ["Cliente", "Adel.", "Saldo", "¿?"],
    sheetRows: [
      ["Agro L.", "93800", "40200", ""],
      ["Frig. T", "56300", "24100", "ver"],
      ["Coop N", "30700", "13200", "#REF!"],
    ],
    chatName: "Socio",
    chat: ["Pasame lo del peaje", "y el ticket del gasoil de ayer", "te lo mando a la noche"],
    dashLabel: "foto_tablero.jpg · km",
    ticket: { station: "ANCAP RUTA 5", fuel: "GASOIL 50-S", liters: "412,6 L", total: "$ 19.800", thanks: "gracias" },
    notebook: ["RAF — saldo ??", "Agro L. debe 40.200", "cubiertas → marzo"],
    calc: "1.081.000",
    winSaldo: ["Agro Litoral · saldo", "$ 40.200"],
    winFuel: ["Gasoil · SBX", "3,1 km/L"],
    steps: [
      "Los saldos quedan anotados en una planilla.",
      "Los gastos llegan por WhatsApp.",
      "Y a fin de mes nadie sabe cuánto ganó.",
      "Kilometría junta todo.",
    ],
  },
  cuentas: {
    eyebrow: "Cobranza",
    title: "Ningún saldo queda sin cobrar.",
    lead: "Cada flete con su adelanto, su saldo y su peaje. Marcás lo que cobraste con un clic y el ingreso se registra solo. En segundos sabés quién te debe y cuánto.",
    sr: "Demostración: al bajar, los saldos y adelantos pendientes de cuatro fletes pasan a cobrados uno por uno y el total a cobrar baja de 134.500 a 13.200 pesos.",
    owedLabel: "Falta cobrar",
    period: "4 fletes · Setiembre",
    cols: ["Cliente", "Camión", "Adelanto", "Saldo", "Peaje"],
    pending: "Pendiente",
    paid: "Cobrado",
    of: "de",
  },
  fletes: [
    { client: "Transportes del Este", truck: "SBX", a: [61400, true], s: [26300, false], p: [4500, true] },
    { client: "Agro Litoral", truck: "RAF", a: [93800, true], s: [40200, false], p: [3500, true], target: true },
    { client: "Frigorífico Tacuarembó", truck: "TMC", a: [56300, true], s: [24100, false], p: [3900, true] },
    { client: "Cooperativa Granos del Norte", truck: "LQB", a: [30700, false], s: [13200, false], p: [2600, true] },
  ],
  lucro: {
    eyebrow: "Rentabilidad",
    title: "Mirá qué camión te deja plata y cuál te la come.",
    lead: "Ingreso, costo y ganancia por kilómetro de cada camión, con seguro, patente y cuotas incluidos. La ganancia que ves es la real.",
    sr: "Demostración: ganancia por kilómetro de cuatro camiones. SBX 14,80 pesos, TMC 9,60, LQB 9,00 y RAF 2,00, marcado con margen bajo.",
    card: "Ganancia por km",
    unit: "$/km · Setiembre",
    low: "Margen bajo",
    inc: "Ingreso/km",
    cost: "Costo/km",
    gain: "Ganancia/km",
    hint: "Pasá el mouse o tocá un camión para ver el detalle",
  },
  avisos: {
    eyebrow: "Tranquilidad",
    title: "Te avisa antes de que se rompa o se venza.",
    lead: "Seguro, SUCTA, permiso MTOP y los vencimientos que crees: aviso una semana antes y el día anterior. Y cada service por km o por fecha, para no enterarte en la ruta.",
    sr: "Demostración: el odómetro del LQB sube hasta pasarse del cambio de aceite, marcado a los 412.000 km, y el aviso pasa de pendiente a vencido. Al lado, un calendario de octubre con vencimientos: la SUCTA del TMC vence mañana y el seguro del SBX en 7 días.",
    month: "Octubre 2026",
    dueDates: "Vencimientos",
    weekdays: ["L", "M", "M", "J", "V", "S", "D"],
    alertsTitle: "Avisos",
    alerts: [
      { label: "Cambio de aceite", plate: "LQB", when: "faltan 800 km", urgent: false },
      { label: "SUCTA", plate: "TMC", when: "vence mañana", urgent: true },
      { label: "Seguro", plate: "SBX", when: "vence en 7 días", urgent: false },
    ],
    odo: { title: "Odómetro · LQB", serviceAt: 412000, from: 411200, to: 412040, left: "faltan", over: "se pasó del cambio", every: "Cambio de aceite cada 20.000 km" },
  },
  bento: {
    title: "Y todo lo demás, también.",
    fuel: {
      title: "Gasoil bajo control",
      text: "Gastos por categoría y km por litro de cada viaje.",
      slices: ["Gasoil", "Peajes", "Cubiertas", "Otros"],
      kml: "km/L · último viaje",
    },
    money: {
      title: "Pesos, reales y dólares",
      text: "Cada gasto en su moneda y el resultado en la que elijas.",
      group: "Moneda de ejemplo",
      options: [
        ["$", "$ 369.440"],
        ["R$", "R$ 50.540"],
        ["US$", "US$ 9.190"],
      ],
      profitLabel: "Ganancia de setiembre",
      tag: "Datos de demostración · cotización de ejemplo",
    },
    fixed: {
      title: "Costos fijos y cuotas",
      text: "Cargás la cuota una vez y se reparte sola todos los meses.",
      months: ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      installment: "Cuota",
      fixed: "Costos fijos",
      span: "12 meses",
    },
    chat: {
      title: "Preguntale a ChatGPT o a Claude",
      text: "“¿Cuánto gasté en peajes en agosto?” y te responde con tus datos. Solo lectura, y lo desconectás cuando quieras.",
      question: "¿Cuánto gasté en peajes en agosto?",
      answer: "En agosto gastaste $ 50.000 en peajes, en 14 viajes. El que más gastó fue el SBX.",
    },
    salary: {
      title: "Salario del chofer",
      text: "Definís el % y el gasto se calcula solo.",
      freight: "Flete",
      freightValue: "$ 90.000",
      driver: "Chofer",
      expense: "Gasto",
      expenseValue: 16200,
    },
    team: {
      title: "Trabajá en equipo",
      text: "Invitá a tu administrativa o a tu socio con un código.",
      copy: "Copiar",
      copied: "Copiado",
      copyLabel: "Copiar código de ejemplo",
    },
  },
  compare: {
    title: "Lo que una planilla no hace.",
    aria: "Comparación entre Excel y Kilometría",
    no: "No",
    yes: "Sí",
    rows: [
      "Te avisa antes de un vencimiento.",
      "Cobrar un saldo actualiza tus ingresos.",
      "Suma las cuotas y los costos fijos del mes.",
      "Varias personas lo usan a la vez, desde el celular.",
      "Pesos, reales y dólares con la cotización del día.",
    ],
    asideEyebrow: "Transporte",
    asideTitle: "Hecho para el transportista.",
    aside: [
      ["Vencimientos que vienen listos — ", "seguro, SUCTA, permiso MTOP", " — y creás los que necesites según tu ruta y los países donde trabajás."],
      ["Pensado para fletes en el ", "Mercosur", ", con pesos, reales y dólares."],
      ["El vocabulario de tu oficina: ", "flete, adelanto, saldo, peaje", "."],
    ],
  },
  steps: {
    title: "Cómo empezar.",
    items: [
      ["Coordinamos una demostración", "con tus números, no con números de ejemplo."],
      ["Cargamos tus camiones", "tus clientes y tus vencimientos."],
      ["Empezás a ver", "cuánto te deja cada camión."],
    ],
  },
  security: {
    title: "Tus números, protegidos.",
    items: [
      ["Tus datos son tuyos.", "Cada empresa ve solo lo suyo, separado en la base de datos."],
      ["Acceso protegido.", "Sesiones seguras y protección contra intentos de acceso repetidos."],
      ["Te podés ir cuando quieras.", "Exportás todo a CSV cuando quieras."],
    ],
  },
  pricing: {
    title: "Pagás por los camiones que tenés.",
    text: "Una cuota base y un monto mensual por camión. Si tenés pocos camiones, pagás poco.",
    question: "¿Cuántos camiones tenés?",
    cta: (fleet) => `Consultá el precio para ${fleet} camiones`,
    includedTitle: "Incluido en todos los planes",
    included: [
      "Cuentas a cobrar con adelanto, saldo y peaje",
      "Ganancia por kilómetro de cada camión",
      "Avisos de mantenimientos y vencimientos",
      "Viajes, gastos por categoría y consumo de gasoil",
      "Costos fijos, cuotas y salario del chofer",
      "Pesos, reales y dólares con cotización automática",
      "Usuarios para tu equipo",
      "Conexión con ChatGPT o Claude, y exportación a CSV",
    ],
  },
  faq: {
    title: "Preguntas frecuentes.",
    lead: ["¿Te quedó alguna duda? ", "Escribinos por WhatsApp"],
    items: [
      ["¿Tengo que saber de computadoras?", "No. Funciona como WhatsApp: desde el celular, con botones grandes. Y podés invitar a quien te ayuda."],
      ["¿Sirve si tengo pocos camiones?", "Sí. Pagás por camión, así que el precio acompaña el tamaño de tu flota."],
      ["¿Mis datos están seguros?", "Cada empresa ve solo sus datos. Nadie más, ni otra empresa del sistema, los puede ver."],
      ["¿Funciona con pesos, reales y dólares?", "Sí, con la cotización del día."],
      ["¿Y lo que tengo en Excel?", "Lo vemos juntos en la demostración y te ayudamos a pasar todo. Y cuando quieras, exportás todo."],
      ["¿Y si vendo un camión?", "Lo das de baja y no perdés lo que facturó ni lo que gastó."],
      ["¿Tengo que instalar algo?", "No. Entrás desde el navegador."],
    ],
  },
  cta: { lines: ["Ordená tu empresa", "este mes."], text: "Te mostramos Kilometría con tus camiones y tus números." },
  dialog: {
    title: "Quiero ver una demostración",
    text: "Te contactamos para coordinar una demostración con tus números.",
    name: "Nombre",
    company: "Empresa",
    trucks: "Cantidad de camiones",
    phone: "Teléfono",
    phonePlaceholder: "09X XXX XXX",
    submit: "Enviar",
    subject: "Demostración Kilometría",
    bodyLabels: ["Nombre", "Empresa", "Camiones", "Teléfono"],
    sentTitle: "¡Listo!",
    sentText: "Se abrió tu correo con los datos cargados. Mandalo y te contactamos para coordinar la demostración.",
    close: "Cerrar",
  },
}

export const CONTENT: Record<Locale, Content> = { pt: PT, es: ES }
