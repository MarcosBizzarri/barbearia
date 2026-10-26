"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { BARBEARIA } from "@/lib/config";
import { btn } from "./ui";

// Evento do Chrome/Edge/Android que permite abrir o "Instalar app" nativo
type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const CHAVE = "instalar-app-visto";

function jaVisto() {
  try {
    return localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

function marcarVisto() {
  try {
    localStorage.setItem(CHAVE, "1");
  } catch {}
}

/** Na primeira visita, oferece instalar o site como app no celular. */
export function InstalarApp() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [ios, setIos] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const instalado =
      matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    if (instalado || jaVisto()) return;

    // iPhone/iPad não têm o botão automático: mostramos o passo a passo
    const ehIos = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (ehIos) {
      timer = setTimeout(() => {
        setIos(true);
        setAberto(true);
      }, 1500);
    }

    const aoPoderInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
      setAberto(true);
    };
    const aoInstalar = () => {
      marcarVisto();
      setAberto(false);
    };
    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  function fechar() {
    marcarVisto();
    setAberto(false);
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    setEvento(null);
    fechar();
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md animate-fade-in" role="dialog" aria-label="Instalar aplicativo">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex gap-3">
        <span className="grid place-items-center h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Instale o app da {BARBEARIA.nome}</p>
          {ios ? (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Toque em <Share className="inline h-4 w-4 align-text-bottom" /> <b>Compartilhar</b> e depois em{" "}
              <SquarePlus className="inline h-4 w-4 align-text-bottom" /> <b>Adicionar à Tela de Início</b>.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">Acesse mais rápido direto do seu celular.</p>
          )}
          <div className="flex gap-2 mt-3">
            {!ios && (
              <button onClick={instalar} className={btn("primario", "sm")}>
                Instalar
              </button>
            )}
            <button onClick={fechar} className={btn("fantasma", "sm", "text-muted-foreground")}>
              {ios ? "Entendi" : "Agora não"}
            </button>
          </div>
        </div>
        <button onClick={fechar} className="self-start p-1 rounded-lg text-muted-foreground hover:bg-muted" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
