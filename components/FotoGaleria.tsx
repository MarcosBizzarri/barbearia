"use client";

import { useEffect, useRef, useState } from "react";
import { Scissors } from "lucide-react";

/** Mostra a foto; se o arquivo ainda não existir, mostra um quadro ilustrativo. */
export function FotoGaleria({ src, legenda, onClick }: { src: string; legenda: string; onClick?: () => void }) {
  const [erro, setErro] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // O erro pode acontecer antes do React assumir a página; confere ao montar
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth === 0) setErro(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square w-full rounded-2xl overflow-hidden card-hover cursor-pointer bg-muted"
    >
      {/* Quadro ilustrativo fica por baixo: aparece enquanto carrega ou se a foto não existir */}
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-neutral-800 to-neutral-950">
        <Scissors className="h-10 w-10 text-white/20 transition-transform duration-500 group-hover:rotate-12" />
      </div>
      {!erro && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          src={src}
          alt={legenda}
          loading="lazy"
          onError={() => setErro(true)}
          className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs sm:text-sm font-semibold text-white opacity-90">
        {legenda}
      </span>
    </button>
  );
}
