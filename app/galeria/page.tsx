"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FotoGaleria } from "@/components/FotoGaleria";
import { GALERIA } from "@/lib/config";

export default function PaginaGaleria() {
  const [aberta, setAberta] = useState<number | null>(null);

  useEffect(() => {
    if (aberta === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null);
      if (e.key === "ArrowRight") setAberta((a) => (a! + 1) % GALERIA.length);
      if (e.key === "ArrowLeft") setAberta((a) => (a! - 1 + GALERIA.length) % GALERIA.length);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberta]);

  return (
    <div className="container py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
        Nossos <span className="text-gradient">trabalhos</span>
      </h1>
      <p className="text-muted-foreground mb-8">Alguns dos cortes feitos aqui na cadeira.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {GALERIA.map((f, i) => (
          <FotoGaleria key={f.src} src={f.src} legenda={f.legenda} onClick={() => setAberta(i)} />
        ))}
      </div>

      {aberta !== null && (
        <div className="fixed inset-0 z-[60] bg-black/90 grid place-items-center p-4 animate-fade-in" onClick={() => setAberta(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white" aria-label="Fechar">
            <X className="h-6 w-6" />
          </button>
          <figure className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GALERIA[aberta].src}
              alt={GALERIA[aberta].legenda}
              className="w-full max-h-[80vh] object-contain rounded-xl bg-neutral-900 min-h-60"
            />
            <figcaption className="text-white text-center mt-3">{GALERIA[aberta].legenda}</figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
