"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarCheck, LayoutDashboard, LogIn, LogOut, Menu, Moon, Scissors, Sun, X } from "lucide-react";
import { BARBEARIA } from "@/lib/config";
import { alternarTema, useTemaEscuro } from "@/lib/cliente";
import { api, modoDemo, useUsuario } from "@/lib/dados";
import { primeiroNome } from "@/lib/tipos";
import { btn } from "./ui";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/agendar/", label: "Agendar" },
  { href: "/fila/", label: "Fila de chegada" },
  { href: "/galeria/", label: "Galeria" },
];

export function Cabecalho() {
  const usuario = useUsuario();
  const caminho = usePathname();
  const router = useRouter();
  const escuro = useTemaEscuro();
  // Guarda em qual página o menu foi aberto: ao navegar, ele fecha sozinho
  const [menuAbertoEm, setMenuAbertoEm] = useState<string | null>(null);
  const aberto = menuAbertoEm === caminho;

  async function sair() {
    await api().sair();
    router.push("/");
  }

  const ativo = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href.replace(/\/$/, "")));
  const nome = usuario ? primeiroNome(usuario.nome) || "amigo(a)" : "";

  const acoesUsuario = usuario ? (
    <>
      {usuario.admin && (
        <Link href="/painel/" className={btn("fantasma", "sm")}>
          <LayoutDashboard className="h-4 w-4" /> Painel
        </Link>
      )}
      <Link href="/meus-horarios/" className={btn("fantasma", "sm")}>
        <CalendarCheck className="h-4 w-4" /> Meus horários
      </Link>
      <button onClick={sair} className={btn("fantasma", "sm")}>
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </>
  ) : usuario === null ? (
    <Link href="/entrar/" className={btn("primario", "sm")}>
      <LogIn className="h-4 w-4" /> Entrar
    </Link>
  ) : (
    <div className="h-9 w-20 rounded-xl bg-muted animate-pulse" />
  );

  return (
    <header className="sticky top-0 z-50 glass">
      {modoDemo && (
        <div className="bg-gold/15 text-[11px] sm:text-xs text-center py-1 px-4 text-foreground/80">
          Modo demonstração — os dados ficam só neste navegador. Configure o Firebase para usar de verdade.
        </div>
      )}
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <span className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-gradient-brand text-white">
            <Scissors className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg md:text-xl font-bold truncate">{BARBEARIA.nome}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                ativo(l.href) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-1">
          <BotaoTema escuro={escuro} onClick={alternarTema} />
          {usuario && (
            <div className="hidden xl:flex items-center gap-2 pl-2 pr-3 mr-1 border-r border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center font-heading font-semibold text-sm">
                {nome[0]?.toUpperCase()}
              </div>
              <span className="font-heading text-sm">
                Olá, <span className="font-semibold">{nome}</span> 👋
              </span>
            </div>
          )}
          {acoesUsuario}
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <BotaoTema escuro={escuro} onClick={alternarTema} />
          <button className="p-2 rounded-lg hover:bg-muted" onClick={() => setMenuAbertoEm(aberto ? null : caminho)} aria-label="Menu">
            {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {usuario && (
              <p className="px-3 pb-2 font-heading text-sm">
                Olá, <span className="font-semibold">{nome}</span> 👋
              </p>
            )}
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  ativo(l.href) ? "text-primary bg-primary/10" : "hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-border">{acoesUsuario}</div>
          </div>
        </div>
      )}
    </header>
  );
}

function BotaoTema({ escuro, onClick }: { escuro: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Alternar tema"
    >
      {escuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
