"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, CalendarCheck, MessageCircle, Plus, Scissors, Trash2, UserPlus, Users, Wallet } from "lucide-react";
import { ExigeLogin } from "@/components/ExigeLogin";
import { btn, cartao } from "@/components/ui";
import { api, mensagemErro } from "@/lib/dados";
import { chaveData, deChave, formatarData, formatarPreco, hoje, horarioPassou, horariosDoDia } from "@/lib/datas";
import type { Agendamento, ItemFila, Usuario } from "@/lib/tipos";

const BLOQUEIO = { id: "bloqueio", nome: "Horário bloqueado", descricao: "", preco: 0, duracao: 30 };
const ENCAIXE = { id: "encaixe", nome: "Encaixe (balcão)", descricao: "", preco: 0, duracao: 30 };

export default function Painel() {
  return (
    <div className="container py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
        Painel do <span className="text-gradient">barbeiro</span>
      </h1>
      <ExigeLogin admin>
        {(u) => (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            <Agenda admin={u} />
            <Fila admin={u} />
          </div>
        )}
      </ExigeLogin>
    </div>
  );
}

function Agenda({ admin }: { admin: Usuario }) {
  const [data, setData] = useState(hoje);
  // Guarda de qual dia é a lista, para mostrar "carregando" ao trocar de dia
  const [carregada, setCarregada] = useState<{ data: string; lista: Agendamento[] } | null>(null);
  const lista = carregada?.data === data ? carregada.lista : null;

  useEffect(() => api().ouvirAgendaDoDia(data, (lista) => setCarregada({ data, lista })), [data]);

  function mudarDia(delta: number) {
    const d = deChave(data);
    d.setDate(d.getDate() + delta);
    setData(chaveData(d));
  }

  async function acao(f: () => Promise<unknown>) {
    try {
      await f();
    } catch (e) {
      alert(mensagemErro(e));
    }
  }

  function usarHorarioLivre(hora: string) {
    const nome = prompt(`${hora} — Nome do cliente para encaixar.\nDeixe em branco para BLOQUEAR o horário.`);
    if (nome === null) return;
    const ehBloqueio = !nome.trim();
    void acao(() =>
      api().agendar(
        { ...admin, nome: ehBloqueio ? "—" : nome.trim(), telefone: "" },
        { data, hora, servico: ehBloqueio ? BLOQUEIO : ENCAIXE },
      ),
    );
  }

  function cancelar(a: Agendamento) {
    const texto = a.servicoId === BLOQUEIO.id ? `Liberar o horário das ${a.hora}?` : `Cancelar ${a.nome} às ${a.hora}?`;
    if (confirm(texto)) void acao(() => api().cancelar(a));
  }

  const porHora = new Map(lista?.map((a) => [a.hora, a]));
  const clientes = lista?.filter((a) => a.servicoId !== BLOQUEIO.id) ?? [];
  const total = clientes.reduce((s, a) => s + a.preco, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Resumo Icone={CalendarCheck} valor={lista ? clientes.length : "–"} rotulo="agendados" />
        <Resumo Icone={Scissors} valor={lista ? horariosDoDia().filter((h) => !porHora.has(h) && !horarioPassou(data, h)).length : "–"} rotulo="livres" />
        <Resumo Icone={Wallet} valor={lista ? formatarPreco(total) : "–"} rotulo="previsto" />
      </div>

      <div className={`${cartao} overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => mudarDia(-1)} className="p-2 rounded-lg hover:bg-muted" aria-label="Dia anterior">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-heading font-bold">{formatarData(data)}</p>
            {data !== hoje() && (
              <button onClick={() => setData(hoje())} className="text-xs text-primary font-semibold hover:underline">
                Voltar para hoje
              </button>
            )}
          </div>
          <button onClick={() => mudarDia(1)} className="p-2 rounded-lg hover:bg-muted" aria-label="Próximo dia">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {!lista ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {horariosDoDia().map((h) => {
              const a = porHora.get(h);
              const passou = horarioPassou(data, h);
              return (
                <div key={h} className={`flex items-center gap-3 px-4 py-2.5 min-h-14 ${passou ? "opacity-50" : ""}`}>
                  <span className="w-12 font-mono text-sm font-semibold">{h}</span>
                  {a ? (
                    a.servicoId === BLOQUEIO.id ? (
                      <span className="flex-1 text-sm text-muted-foreground italic">Bloqueado</span>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{a.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {a.servicoNome}
                          {a.preco > 0 && ` · ${formatarPreco(a.preco)}`}
                        </p>
                      </div>
                    )
                  ) : (
                    <span className="flex-1 text-sm text-success font-medium">Livre</span>
                  )}
                  <div className="flex items-center gap-1">
                    {a?.telefone && (
                      <a
                        href={`https://wa.me/55${a.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-muted text-success"
                        aria-label="WhatsApp do cliente"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                    {a ? (
                      <button onClick={() => cancelar(a)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Cancelar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      !passou && (
                        <button onClick={() => usarHorarioLivre(h)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" aria-label="Encaixar ou bloquear">
                          <Plus className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Dica: clique no <b>+</b> de um horário livre para encaixar um cliente do balcão ou bloquear (almoço, folga).
      </p>
    </div>
  );
}

function Fila({ admin }: { admin: Usuario }) {
  const [fila, setFila] = useState<ItemFila[] | null>(null);
  const [nome, setNome] = useState("");

  useEffect(() => api().ouvirFila(hoje(), setFila), []);

  const atendendo = fila?.filter((i) => i.status === "atendendo") ?? [];
  const aguardando = fila?.filter((i) => i.status === "aguardando") ?? [];

  async function acao(f: () => Promise<unknown>) {
    try {
      await f();
    } catch (e) {
      alert(mensagemErro(e));
    }
  }

  function adicionar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    void acao(() => api().adicionarNaFila(nome, admin.uid));
    setNome("");
  }

  // Finaliza quem está na cadeira e chama o próximo da fila
  function chamarProximo() {
    void acao(async () => {
      for (const i of atendendo) await api().sairDaFila(i);
      if (aguardando[0]) await api().mudarStatusFila(aguardando[0], "atendendo");
    });
  }

  return (
    <div className={`${cartao} overflow-hidden lg:sticky lg:top-24`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <p className="font-heading font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Fila de hoje
        </p>
        <span className="text-sm text-muted-foreground">{aguardando.length} aguardando</span>
      </div>

      <div className="p-4 space-y-3">
        <button onClick={chamarProximo} disabled={!fila || (aguardando.length === 0 && atendendo.length === 0)} className={btn("primario", "md", "w-full")}>
          <Scissors className="h-4 w-4" /> {aguardando.length ? "Chamar próximo" : "Finalizar atendimento"}
        </button>
        <form onSubmit={adicionar} className="flex gap-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome de quem chegou"
            className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <button type="submit" className={btn("contorno", "sm", "h-10")} aria-label="Adicionar na fila">
            <UserPlus className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {atendendo.map((i) => (
          <div key={i.id} className="flex items-center gap-3 px-4 py-3 bg-success/10">
            <Scissors className="h-4 w-4 text-success" />
            <span className="font-semibold flex-1">{i.nome}</span>
            <span className="text-xs font-semibold text-success">Na cadeira</span>
          </div>
        ))}
        {aguardando.map((i, n) => (
          <div key={i.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-6 h-6 rounded-full bg-muted grid place-items-center text-xs font-bold">{n + 1}</span>
            <span className="flex-1 text-sm">{i.nome}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(i.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button onClick={() => void acao(() => api().sairDaFila(i))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Remover">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {fila && fila.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Ninguém na fila</p>}
      </div>
    </div>
  );
}

function Resumo({ Icone, valor, rotulo }: { Icone: typeof Users; valor: string | number; rotulo: string }) {
  return (
    <div className={`${cartao} p-4`}>
      <Icone className="h-5 w-5 text-primary mb-1" />
      <p className="font-heading text-xl md:text-2xl font-bold truncate">{valor}</p>
      <p className="text-xs text-muted-foreground">{rotulo}</p>
    </div>
  );
}
