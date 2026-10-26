import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { CarrosselDestaques } from "@/components/CarrosselDestaques";
import { FotoGaleria } from "@/components/FotoGaleria";
import { StatusAoVivo } from "@/components/StatusAoVivo";
import { btn, cartao } from "@/components/ui";
import { BARBEARIA, GALERIA, HORARIOS, PRODUTOS, SERVICOS } from "@/lib/config";
import { formatarPreco } from "@/lib/datas";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const diasAbertos = DIAS.filter((_, i) => !HORARIOS.diasFechados.includes(i));

export default function Home() {
  const mapa = encodeURIComponent(BARBEARIA.endereco);

  return (
    <div className="bg-background">
      <section aria-label="Destaques">
        <CarrosselDestaques />
      </section>

      <section className="container py-10 md:py-16 text-center">
        <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
          Seu estilo, <span className="text-gradient">nossa arte</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg mb-7 leading-relaxed max-w-xl mx-auto">
          Agende seu horário em poucos cliques. Sem espera, sem complicação.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Link href="/agendar/" className={btn("primario", "lg")}>
            Agendar agora <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/galeria/" className={btn("contorno", "lg")}>
            Ver trabalhos
          </Link>
        </div>
        <StatusAoVivo />
      </section>

      <section className="container pb-16 md:pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`${cartao} p-6 card-hover flex flex-col`}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center mb-4">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold mb-2">Agendamento Rápido</h3>
            <p className="text-muted-foreground text-sm mb-4">Escolha data, horário e serviço em segundos.</p>
            <div className="mt-auto space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> {HORARIOS.inicio} às {HORARIOS.fim}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {diasAbertos.map((d) => (
                  <span key={d} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`${cartao} p-6 card-hover flex flex-col items-center text-center`}>
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-brand grid place-items-center text-white font-heading text-3xl font-bold border-4 border-primary/20">
                {BARBEARIA.barbeiro
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold mb-2">{BARBEARIA.barbeiro}</h3>
            <p className="text-muted-foreground text-sm mb-4">{BARBEARIA.bio}</p>
            <a
              href={`https://wa.me/${BARBEARIA.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={btn("contorno", "sm", "mt-auto")}
            >
              <MessageCircle className="h-4 w-4 text-success" /> Chamar no WhatsApp
            </a>
          </div>

          <div className={`${cartao} overflow-hidden card-hover flex flex-col`}>
            <div className="p-6 pb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-1">Localização</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{BARBEARIA.endereco}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapa}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir localização no Google Maps"
              className="relative block w-full aspect-[16/10] bg-muted mt-auto group"
            >
              <iframe
                title="Mapa da localização"
                src={`https://www.google.com/maps?q=${mapa}&output=embed`}
                className="w-full h-full border-0 pointer-events-none grayscale-[0.15] transition-all duration-500 group-hover:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 border-y border-border">
        <div className="container py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Serviços e preços</h2>
            <p className="text-muted-foreground mt-2">Escolha o seu e garanta o horário</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICOS.map((s) => (
              <Link
                key={s.id}
                href={`/agendar/?servico=${s.id}`}
                className={`${cartao} p-5 card-hover flex items-center justify-between gap-4 group`}
              >
                <div>
                  <p className="font-heading font-bold">{s.nome}</p>
                  <p className="text-sm text-muted-foreground">{s.descricao}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatarPreco(s.preco)}</p>
                  <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Agendar →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Produtos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRODUTOS.map((p) => (
            <div key={p.nome} className={`${cartao} p-4 card-hover`}>
              <div className="aspect-square rounded-xl bg-muted grid place-items-center mb-3">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold leading-tight">{p.nome}</p>
              <p className="text-sm text-primary font-bold mt-1">{formatarPreco(p.preco)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Disponíveis na barbearia. Peça na hora do atendimento.</p>
      </section>

      <section className="container pb-16 md:pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Nossos Trabalhos</h2>
          <Link href="/galeria/" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {GALERIA.slice(0, 3).map((f) => (
            <FotoGaleria key={f.src} src={f.src} legenda={f.legenda} />
          ))}
        </div>
      </section>

      <section id="cta-agendar" className="bg-primary">
        <div className="container py-12 md:py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Pronto para renovar seu visual?
          </h2>
          <p className="text-primary-foreground/80 mb-6">Agende agora e garanta seu horário</p>
          <Link href="/agendar/" className={btn("secundario", "lg")}>
            Agendar horário <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
