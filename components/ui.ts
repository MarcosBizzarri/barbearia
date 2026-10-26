type Variante = "primario" | "contorno" | "secundario" | "fantasma" | "perigo";
type Tamanho = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const variantes: Record<Variante, string> = {
  primario: "bg-primary text-primary-foreground hover:brightness-110 shadow-sm shadow-primary/20",
  contorno: "border border-border bg-card hover:bg-muted",
  secundario: "bg-white text-neutral-900 hover:bg-neutral-100",
  fantasma: "hover:bg-muted text-foreground",
  perigo: "border border-destructive/30 text-destructive hover:bg-destructive/10",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function btn(variante: Variante = "primario", tamanho: Tamanho = "md", extra = "") {
  return `${base} ${variantes[variante]} ${tamanhos[tamanho]} ${extra}`;
}

export const campo =
  "w-full h-11 rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export const cartao = "bg-card border border-border rounded-2xl";
