import type { Servico } from "./config";

export type Usuario = {
  uid: string;
  nome: string;
  email: string;
  telefone: string;
  admin: boolean;
};

export type Agendamento = {
  id: string;
  uid: string;
  nome: string;
  telefone: string;
  servicoId: string;
  servicoNome: string;
  preco: number;
  data: string;
  hora: string;
  criadoEm: number;
};

export type StatusFila = "aguardando" | "atendendo";

export type ItemFila = {
  id: string;
  uid: string;
  nome: string;
  data: string;
  status: StatusFila;
  criadoEm: number;
};

export type Cancelar = () => void;

export interface Backend {
  demo: boolean;

  ouvirUsuario(cb: (u: Usuario | null) => void): Cancelar;
  entrar(email: string, senha: string): Promise<void>;
  cadastrar(d: { nome: string; telefone: string; email: string; senha: string }): Promise<void>;
  recuperarSenha(email: string): Promise<void>;
  sair(): Promise<void>;

  /** Horários já reservados no dia (atualiza em tempo real). */
  ouvirOcupados(data: string, cb: (horas: Set<string>) => void): Cancelar;
  /** Reserva o horário. Falha com ErroHorarioOcupado se alguém pegou antes. */
  agendar(u: Usuario, a: { data: string; hora: string; servico: Servico }): Promise<Agendamento>;
  ouvirMeusAgendamentos(uid: string, cb: (lista: Agendamento[]) => void): Cancelar;
  cancelar(a: Agendamento): Promise<void>;
  /** Somente administrador. */
  ouvirAgendaDoDia(data: string, cb: (lista: Agendamento[]) => void): Cancelar;

  ouvirFila(data: string, cb: (lista: ItemFila[]) => void): Cancelar;
  entrarNaFila(u: Usuario): Promise<void>;
  sairDaFila(item: ItemFila): Promise<void>;
  /** Somente administrador. */
  adicionarNaFila(nome: string, adminUid: string): Promise<void>;
  /** Somente administrador. */
  mudarStatusFila(item: ItemFila, status: StatusFila): Promise<void>;
}

export class ErroHorarioOcupado extends Error {
  constructor() {
    super("Esse horário acabou de ser reservado por outra pessoa. Escolha outro.");
  }
}

export function ordenarAgendamentos(lista: Agendamento[]): Agendamento[] {
  return [...lista].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
}

export function ordenarFila(lista: ItemFila[]): ItemFila[] {
  return [...lista].sort((a, b) => a.criadoEm - b.criadoEm);
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}
