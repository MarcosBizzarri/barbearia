"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Lock, LogIn } from "lucide-react";
import { useUsuario } from "@/lib/dados";
import type { Usuario } from "@/lib/tipos";
import { btn, cartao } from "./ui";

/** Mostra o conteúdo só para quem está logado (e, se pedido, só para o administrador). */
export function ExigeLogin({ admin, children }: { admin?: boolean; children: (u: Usuario) => ReactNode }) {
  const usuario = useUsuario();
  const caminho = usePathname();

  if (usuario === undefined) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;

  if (usuario === null) {
    return (
      <div className={`${cartao} p-8 text-center max-w-md mx-auto`}>
        <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-heading text-xl font-bold mb-1">Entre na sua conta</p>
        <p className="text-sm text-muted-foreground mb-5">Você precisa estar logado para ver esta página.</p>
        <Link href={`/entrar/?voltar=${encodeURIComponent(caminho)}`} className={btn("primario", "md")}>
          <LogIn className="h-4 w-4" /> Entrar
        </Link>
      </div>
    );
  }

  if (admin && !usuario.admin) {
    return (
      <div className={`${cartao} p-8 text-center max-w-md mx-auto`}>
        <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-heading text-xl font-bold mb-1">Área do barbeiro</p>
        <p className="text-sm text-muted-foreground">Somente o administrador tem acesso a esta página.</p>
      </div>
    );
  }

  return <>{children(usuario)}</>;
}
