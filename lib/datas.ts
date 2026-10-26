import { HORARIOS } from "./config";

/** Data local no formato AAAA-MM-DD (sem fuso UTC). */
export function chaveData(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function deChave(chave: string): Date {
  const [a, m, d] = chave.split("-").map(Number);
  return new Date(a, m - 1, d);
}

export function hoje(): string {
  return chaveData(new Date());
}

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Todos os horários do dia: 09:00, 09:30 ... 19:00 */
export function horariosDoDia(): string[] {
  const lista: string[] = [];
  for (let t = minutos(HORARIOS.inicio); t <= minutos(HORARIOS.fim); t += HORARIOS.intervaloMin) {
    lista.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return lista;
}

/** Horário já passou? (só faz diferença para hoje) */
export function horarioPassou(data: string, hora: string): boolean {
  const agora = new Date();
  if (data !== chaveData(agora)) return data < chaveData(agora);
  return minutos(hora) <= agora.getHours() * 60 + agora.getMinutes();
}

export function diaAberto(d: Date): boolean {
  return !HORARIOS.diasFechados.includes(d.getDay());
}

/** "Terça-feira, 27 de outubro" (só a primeira letra maiúscula) */
export function formatarData(chave: string, opcoes?: Intl.DateTimeFormatOptions): string {
  const t = deChave(chave).toLocaleDateString("pt-BR", opcoes ?? { weekday: "long", day: "2-digit", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function formatarPreco(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Id do horário no banco: 2026-12-20_0930 */
export function idHorario(data: string, hora: string): string {
  return `${data}_${hora.replace(":", "")}`;
}
