// =====================================================================
//  CONFIGURAÇÃO DA BARBEARIA — edite aqui nome, contatos, serviços e horários
// =====================================================================

export const BARBEARIA = {
  nome: "Barbearia Alexandre Monteiro",
  nomeCurto: "Alexandre Monteiro",
  barbeiro: "Alexandre Monteiro",
  bio: "+10 anos de experiência em cortes masculinos modernos e clássicos. Especialista em degradê, barba modelada e visagismo.",
  endereco: "Rua Exemplo, 123 - Centro, São Paulo - SP",
  // Somente números com DDI + DDD (usado nos links de WhatsApp e telefone)
  whatsapp: "5519995068253",
  telefoneExibicao: "(19) 99506-8253",
  instagram: "https://instagram.com/",
};

/** Contato de quem desenvolveu o site (aparece no rodapé). */
export const DESENVOLVEDOR = {
  nome: "Marcos Bizzarri",
  whatsapp: "5519994449107",
  telefoneExibicao: "(19) 99444-9107",
};

/** Horário de funcionamento: primeiro e último horário que pode ser agendado. */
export const HORARIOS = {
  inicio: "09:00",
  fim: "19:00",
  intervaloMin: 30,
  /** Dias fechados (0 = domingo, 1 = segunda ... 6 = sábado) */
  diasFechados: [0],
  /** Até quantos dias à frente o cliente pode agendar */
  diasAntecedencia: 30,
};

export type Servico = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
};

export const SERVICOS: Servico[] = [
  { id: "corte", nome: "Corte masculino", descricao: "Tesoura e máquina, finalização inclusa", preco: 40, duracao: 30 },
  { id: "degrade", nome: "Degradê / Navalhado", descricao: "Degradê na navalha com acabamento", preco: 45, duracao: 30 },
  { id: "barba", nome: "Barba", descricao: "Toalha quente, navalha e hidratação", preco: 30, duracao: 30 },
  { id: "corte-barba", nome: "Corte + Barba", descricao: "O combo completo", preco: 65, duracao: 30 },
  { id: "sobrancelha", nome: "Sobrancelha", descricao: "Design na navalha", preco: 15, duracao: 30 },
  { id: "infantil", nome: "Corte infantil", descricao: "Até 12 anos", preco: 35, duracao: 30 },
];

export const PRODUTOS = [
  { nome: "Pomada modeladora", preco: 35 },
  { nome: "Óleo para barba", preco: 30 },
  { nome: "Creme de pentear", preco: 30 },
  { nome: "Gel para barba", preco: 25 },
  { nome: "Minoxidil", preco: 60 },
  { nome: "Matizador", preco: 40 },
];

/**
 * Fotos da galeria. Coloque os arquivos em `public/galeria/` com estes nomes
 * (ou troque a lista). Enquanto a foto não existir, aparece um quadro ilustrativo.
 */
export const GALERIA = [
  { src: "/galeria/1.jpg", legenda: "Degradê navalhado" },
  { src: "/galeria/2.jpg", legenda: "Corte social" },
  { src: "/galeria/3.jpg", legenda: "Barba modelada" },
  { src: "/galeria/4.jpg", legenda: "Corte + barba" },
  { src: "/galeria/5.jpg", legenda: "Corte infantil" },
  { src: "/galeria/6.jpg", legenda: "Risquinho" },
];
