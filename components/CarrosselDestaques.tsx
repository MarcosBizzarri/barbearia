"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, ChevronLeft, ChevronRight, ListOrdered, Scissors } from "lucide-react";
import { SERVICOS } from "@/lib/config";
import { formatarPreco } from "@/lib/datas";
import { btn } from "./ui";

const combo = SERVICOS.find((s) => s.id === "corte-barba");

const SLIDES = [
  {
    selo: "Fim de ano",
    titulo: "A agenda de dezembro já está aberta",
    texto: "Época de festa é época de fila. Reserve seu horário agora e chegue só na hora.",
    acao: { href: "/agendar/", label: "Reservar horário" },
    Icone: CalendarCheck,
    fundo: "from-neutral-950 via-neutral-900 to-[#3b1210]",
  },
  {
    selo: "Combo",
    titulo: combo ? `Corte + Barba por ${formatarPreco(combo.preco)}` : "Corte + Barba",
    texto: "Toalha quente, navalha e acabamento caprichado. Saia pronto para a foto.",
    acao: { href: "/agendar/", label: "Quero o combo" },
    Icone: Scissors,
    fundo: "from-[#2a1406] via-neutral-900 to-neutral-950",
  },
  {
    selo: "Sem agendamento?",
    titulo: "Entre na fila de chegada pelo celular",
    texto: "Veja quantas pessoas estão na sua frente e venha na hora certa.",
    acao: { href: "/fila/", label: "Ver a fila agora" },
    Icone: ListOrdered,
    fundo: "from-neutral-950 via-[#101a33] to-neutral-900",
  },
];

export function CarrosselDestaques() {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setAtual((a) => (a + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [pausado]);

  const ir = (d: number) => setAtual((a) => (a + d + SLIDES.length) % SLIDES.length);

  return (
    <div
      className="relative overflow-hidden h-[340px] sm:h-[380px] md:h-[440px]"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {SLIDES.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== atual}
          className={`absolute inset-0 bg-gradient-to-br ${s.fundo} transition-opacity duration-700 ${
            i === atual ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="container relative h-full flex items-center">
            <div className="max-w-xl text-white">
              <span className="inline-block rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-gold">
                {s.selo}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mt-4 leading-tight">{s.titulo}</h2>
              <p className="text-white/70 mt-3 md:text-lg">{s.texto}</p>
              <Link href={s.acao.href} className={btn("primario", "lg", "mt-6")}>
                {s.acao.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="hidden md:flex absolute right-8 lg:right-16 items-center gap-8">
              <s.Icone className="h-40 w-40 lg:h-52 lg:w-52 text-white/10" strokeWidth={1} />
              <div className="h-56 w-7 rounded-full overflow-hidden ring-4 ring-white/10 poste" />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => ir(-1)}
        aria-label="Anterior"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 hidden sm:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => ir(1)}
        aria-label="Próximo"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 hidden sm:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setAtual(i)}
            aria-label={`Destaque ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === atual ? "w-6 bg-white" : "w-2 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
