import { BARBEARIA } from "@/lib/config";

export function Rodape() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {BARBEARIA.nome}.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Desenvolvido com dedicação · Contato:{" "}
          <a href={`tel:+${BARBEARIA.whatsapp}`} className="text-primary/80 hover:text-primary transition-colors">
            {BARBEARIA.telefoneExibicao}
          </a>
        </p>
      </div>
    </footer>
  );
}
