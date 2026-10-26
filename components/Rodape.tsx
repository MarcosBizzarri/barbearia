import { Code2, MessageCircle } from "lucide-react";
import { BARBEARIA, DESENVOLVEDOR } from "@/lib/config";

export function Rodape() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8 text-center space-y-3">
        <p className="font-heading font-bold">{BARBEARIA.nome}</p>
        <p className="text-sm text-muted-foreground">
          Agendamentos e contato:{" "}
          <a
            href={`https://wa.me/${BARBEARIA.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-success" /> {BARBEARIA.telefoneExibicao}
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {BARBEARIA.nome}.
        </p>
        <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1 flex-wrap">
          <Code2 className="h-3.5 w-3.5" /> Desenvolvido por {DESENVOLVEDOR.nome} ·{" "}
          <a
            href={`https://wa.me/${DESENVOLVEDOR.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/80 hover:text-primary transition-colors"
          >
            {DESENVOLVEDOR.telefoneExibicao}
          </a>
        </p>
      </div>
    </footer>
  );
}
