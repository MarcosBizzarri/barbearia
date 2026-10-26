"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarCheck, Clock, Plus, Trash2 } from "lucide-react";
import { ExigeLogin } from "@/components/ExigeLogin";
import { btn, cartao } from "@/components/ui";
import { api, mensagemErro } from "@/lib/dados";
import { formatarData, formatarPreco, horarioPassou } from "@/lib/datas";
import type { Agendamento, Usuario } from "@/lib/tipos";

export default function MeusHorarios() {
  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
        Meus <span className="text-gradient">horários</span>
      </h1>
      <ExigeLogin>{(u) => <Lista usuario={u} />}</ExigeLogin>
    </div>
  );
}

function Lista({ usuario }: { usuario: Usuario }) {
  const [lista, setLista] = useState<Agendamento[] | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);

  useEffect(() => api().ouvirMeusAgendamentos(usuario.uid, setLista), [usuario.uid]);

  async function cancelar(a: Agendamento) {
    if (!confirm(`Cancelar o horário de ${formatarData(a.data)} às ${a.hora}?`)) return;
    setCancelando(a.id);
    try {
      await api().cancelar(a);
    } catch (e) {
      alert(mensagemErro(e));
    } finally {
      setCancelando(null);
    }
  }

  if (!lista) return <div className="h-40 rounded-2xl bg-muted animate-pulse" />;

  const proximos = lista.filter((a) => !horarioPassou(a.data, a.hora));
  const anteriores = lista.filter((a) => horarioPassou(a.data, a.hora)).reverse();

  return (
    <div className="space-y-8">
      {proximos.length === 0 ? (
        <div className={`${cartao} p-8 text-center`}>
          <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold mb-1">Nenhum horário marcado</p>
          <p className="text-sm text-muted-foreground mb-5">Que tal já garantir o seu?</p>
          <Link href="/agendar/" className={btn("primario", "md")}>
            <Plus className="h-4 w-4" /> Agendar agora
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proximos.map((a) => (
            <div key={a.id} className={`${cartao} p-4 md:p-5 flex items-center gap-4`}>
              <div className="w-16 shrink-0 text-center rounded-xl bg-primary/10 text-primary py-2">
                <p className="text-xs font-semibold uppercase">
                  {formatarData(a.data, { month: "short" }).replace(".", "")}
                </p>
                <p className="font-heading text-2xl font-bold leading-none">{a.data.slice(8)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold truncate">{a.servicoNome}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {formatarData(a.data, { weekday: "long" })} às {a.hora} ·{" "}
                  {formatarPreco(a.preco)}
                </p>
              </div>
              <button
                onClick={() => cancelar(a)}
                disabled={cancelando === a.id}
                className={btn("perigo", "sm")}
                aria-label="Cancelar horário"
              >
                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Cancelar</span>
              </button>
            </div>
          ))}
          <Link href="/agendar/" className={btn("contorno", "md", "w-full")}>
            <Plus className="h-4 w-4" /> Novo agendamento
          </Link>
        </div>
      )}

      {anteriores.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold mb-3 text-muted-foreground">Histórico</h2>
          <div className="space-y-2">
            {anteriores.slice(0, 10).map((a) => (
              <div key={a.id} className="flex justify-between text-sm px-4 py-3 rounded-xl bg-muted/60">
                <span>{a.servicoNome}</span>
                <span className="text-muted-foreground">
                  {formatarData(a.data, { day: "2-digit", month: "2-digit", year: "numeric" })} · {a.hora}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
