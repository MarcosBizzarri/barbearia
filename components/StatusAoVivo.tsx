"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Users } from "lucide-react";
import { useNoCliente } from "@/lib/cliente";
import { api } from "@/lib/dados";
import { diaAberto, hoje, horarioPassou, horariosDoDia } from "@/lib/datas";

/** Mostra em tempo real quantos horários ainda estão livres hoje e quantas pessoas estão na fila. */
export function StatusAoVivo() {
  const [livres, setLivres] = useState<number | null>(null);
  const [fila, setFila] = useState<number | null>(null);
  const aberto = !useNoCliente() || diaAberto(new Date());

  useEffect(() => {
    const data = hoje();
    const c1 = api().ouvirOcupados(data, (ocupados) =>
      setLivres(horariosDoDia().filter((h) => !ocupados.has(h) && !horarioPassou(data, h)).length),
    );
    const c2 = api().ouvirFila(data, (l) => setFila(l.filter((i) => i.status === "aguardando").length));
    return () => {
      c1();
      c2();
    };
  }, []);

  if (!aberto) {
    return (
      <p className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" /> Hoje estamos fechados — agende para os próximos dias
      </p>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 text-sm">
      <Link
        href="/agendar/"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 hover:border-primary/40 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <b>{livres ?? "–"}</b> horários livres hoje
      </Link>
      <Link
        href="/fila/"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 hover:border-primary/40 transition-colors"
      >
        <Users className="h-4 w-4 text-primary" />
        <b>{fila ?? "–"}</b> {fila === 1 ? "pessoa" : "pessoas"} na fila agora
      </Link>
    </div>
  );
}
