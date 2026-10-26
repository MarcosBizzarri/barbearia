"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HORARIOS } from "@/lib/config";
import { chaveData, diaAberto } from "@/lib/datas";

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export function Calendario({ selecionada, onSelecionar }: { selecionada: string | null; onSelecionar: (data: string) => void }) {
  const hojeD = new Date();
  hojeD.setHours(0, 0, 0, 0);
  const limite = new Date(hojeD);
  limite.setDate(limite.getDate() + HORARIOS.diasAntecedencia);

  const [mes, setMes] = useState(() => new Date(hojeD.getFullYear(), hojeD.getMonth(), 1));

  const primeiroDiaSemana = mes.getDay();
  const diasNoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celulas: (Date | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1)),
  ];

  const podeVoltar = mes > new Date(hojeD.getFullYear(), hojeD.getMonth(), 1);
  const podeAvancar = new Date(mes.getFullYear(), mes.getMonth() + 1, 1) <= limite;
  const titulo = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
          disabled={!podeVoltar}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-heading font-bold capitalize">{titulo}</p>
        <button
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
          disabled={!podeAvancar}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
        {SEMANA.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celulas.map((d, i) => {
          if (!d) return <div key={i} />;
          const chave = chaveData(d);
          const fechado = !diaAberto(d);
          const desabilitado = d < hojeD || d > limite || fechado;
          const ativo = chave === selecionada;
          const ehHoje = d.getTime() === hojeD.getTime();
          return (
            <button
              key={i}
              disabled={desabilitado}
              onClick={() => onSelecionar(chave)}
              title={fechado ? "Fechado" : undefined}
              className={`relative aspect-square rounded-xl text-sm font-semibold transition-all ${
                ativo
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : desabilitado
                    ? "text-muted-foreground/35 cursor-not-allowed"
                    : "hover:bg-primary/10 hover:text-primary"
              } ${fechado && !(d < hojeD) ? "line-through" : ""}`}
            >
              {d.getDate()}
              {ehHoje && !ativo && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Agendamentos para os próximos {HORARIOS.diasAntecedencia} dias · dias riscados = fechado
      </p>
    </div>
  );
}
