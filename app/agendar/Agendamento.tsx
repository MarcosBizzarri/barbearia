"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarCheck,
  Check,
  CircleCheck,
  Clock,
  LoaderCircle,
  LogIn,
  MessageCircle,
  Scissors,
} from "lucide-react";
import { btn, cartao } from "@/components/ui";
import { BARBEARIA, SERVICOS } from "@/lib/config";
import { useNoCliente } from "@/lib/cliente";
import { api, mensagemErro, useUsuario } from "@/lib/dados";
import { formatarData, formatarPreco, horarioPassou, horariosDoDia } from "@/lib/datas";
import type { Agendamento as TipoAgendamento } from "@/lib/tipos";
import { Calendario } from "./Calendario";

const ETAPAS = [
  { n: 1, rotulo: "Serviço", Icone: Scissors },
  { n: 2, rotulo: "Data", Icone: Calendar },
  { n: 3, rotulo: "Horário", Icone: Clock },
  { n: 4, rotulo: "Confirmar", Icone: Check },
];

export function Agendamento() {
  const params = useSearchParams();
  const router = useRouter();
  const caminho = usePathname();
  const usuario = useUsuario();

  // A escolha fica na URL: se a pessoa precisar fazer login no meio, volta exatamente aqui
  const servicoId = params.get("servico");
  const data = params.get("data");
  const hora = params.get("hora");
  const servico = SERVICOS.find((s) => s.id === servicoId) ?? null;
  const etapa = !servico ? 1 : !data ? 2 : !hora ? 3 : 4;

  const montado = useNoCliente();
  const [carregados, setCarregados] = useState<{ data: string; horas: Set<string> } | null>(null);
  const ocupados = carregados?.data === data ? carregados.horas : null;
  const [meus, setMeus] = useState<TipoAgendamento[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmado, setConfirmado] = useState<TipoAgendamento | null>(null);

  useEffect(() => {
    if (!data) return;
    return api().ouvirOcupados(data, (horas) => setCarregados({ data, horas }));
  }, [data]);

  useEffect(() => {
    if (!usuario) return;
    return api().ouvirMeusAgendamentos(usuario.uid, setMeus);
  }, [usuario]);

  function ir(mudancas: Record<string, string | null>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    setErro("");
    router.push(`${caminho}?${p.toString()}`, { scroll: false });
  }

  // Se alguém reservar o horário escolhido enquanto a pessoa confirma, avisa na hora
  const horaFoiTomada = !!(hora && ocupados?.has(hora) && !confirmado);
  const jaTemNoDia = meus.find((a) => a.data === data);

  async function confirmar() {
    if (!usuario || !servico || !data || !hora) return;
    setSalvando(true);
    setErro("");
    try {
      setConfirmado(await api().agendar(usuario, { data, hora, servico }));
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (!montado) return <div className="h-96 rounded-2xl bg-muted animate-pulse" />;

  if (confirmado) return <Sucesso ag={confirmado} />;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">
          Agende seu <span className="text-gradient">horário</span>
        </h1>
      </div>

      {/* Indicador de etapas */}
      <div className="flex items-center justify-center mb-10">
        {ETAPAS.map((e, i) => (
          <div key={e.n} className="flex items-center">
            <button
              disabled={e.n >= etapa}
              onClick={() =>
                ir(e.n === 1 ? { servico: null, data: null, hora: null } : e.n === 2 ? { data: null, hora: null } : { hora: null })
              }
              className="flex flex-col items-center disabled:cursor-default"
            >
              <span
                className={`w-10 h-10 rounded-full grid place-items-center transition-all ${
                  etapa >= e.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {etapa > e.n ? <Check className="h-5 w-5" /> : <e.Icone className="h-5 w-5" />}
              </span>
              <span className={`text-xs mt-1 font-medium ${etapa >= e.n ? "" : "text-muted-foreground"}`}>{e.rotulo}</span>
            </button>
            {i < ETAPAS.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-1 md:mx-2 mb-5 ${etapa > e.n ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div key={etapa} className="animate-fade-in">
        {etapa > 1 && (
          <button
            onClick={() => ir(etapa === 2 ? { servico: null } : etapa === 3 ? { data: null } : { hora: null })}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        )}

        {etapa === 1 && (
          <>
            <Titulo t="Escolha o serviço" s="Selecione o serviço desejado" />
            <div className="grid sm:grid-cols-2 gap-3">
              {SERVICOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => ir({ servico: s.id })}
                  className={`${cartao} p-4 text-left card-hover hover:border-primary/50 flex items-center justify-between gap-3`}
                >
                  <div>
                    <p className="font-heading font-bold">{s.nome}</p>
                    <p className="text-sm text-muted-foreground">{s.descricao}</p>
                  </div>
                  <p className="font-bold text-primary shrink-0">{formatarPreco(s.preco)}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {etapa === 2 && (
          <>
            <Titulo t="Escolha a data" s="Selecione o dia do seu atendimento" />
            <Calendario selecionada={data} onSelecionar={(d) => ir({ data: d, hora: null })} />
          </>
        )}

        {etapa === 3 && data && (
          <>
            <Titulo t="Escolha o horário" s={formatarData(data)} />
            <GradeHorarios data={data} ocupados={ocupados} onEscolher={(h) => ir({ hora: h })} />
          </>
        )}

        {etapa === 4 && servico && data && hora && (
          <>
            <Titulo t="Confirme seu agendamento" s="Revise os detalhes abaixo" />
            <div className={`${cartao} p-5 md:p-6 space-y-4`}>
              <Linha rotulo="Serviço" valor={servico.nome} />
              <Linha rotulo="Data" valor={formatarData(data)} />
              <Linha rotulo="Horário" valor={hora} />
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="font-heading text-2xl font-bold text-primary">{formatarPreco(servico.preco)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Pagamento na barbearia. Chegue 5 minutos antes.</p>
            </div>

            {horaFoiTomada && (
              <Alerta>
                Ops! O horário das {hora} acabou de ser reservado por outra pessoa.{" "}
                <button className="underline font-semibold" onClick={() => ir({ hora: null })}>
                  Escolher outro horário
                </button>
              </Alerta>
            )}
            {!horaFoiTomada && horarioPassou(data, hora) && (
              <Alerta>
                Esse horário já passou.{" "}
                <button className="underline font-semibold" onClick={() => ir({ hora: null })}>
                  Escolher outro
                </button>
              </Alerta>
            )}
            {jaTemNoDia && (
              <Alerta>
                Você já tem um horário neste dia ({jaTemNoDia.hora} – {jaTemNoDia.servicoNome}). Para trocar, cancele em{" "}
                <Link href="/meus-horarios/" className="underline font-semibold">
                  Meus horários
                </Link>
                .
              </Alerta>
            )}
            {erro && <Alerta>{erro}</Alerta>}

            {usuario === null ? (
              <Link
                href={`/entrar/?voltar=${encodeURIComponent(`${caminho}?${params.toString()}`)}`}
                className={btn("primario", "lg", "w-full mt-6")}
              >
                <LogIn className="h-4 w-4" /> Entrar para confirmar
              </Link>
            ) : (
              <button
                onClick={confirmar}
                disabled={!usuario || salvando || horaFoiTomada || !!jaTemNoDia || horarioPassou(data, hora)}
                className={btn("primario", "lg", "w-full mt-6")}
              >
                {salvando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                Confirmar agendamento
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GradeHorarios({
  data,
  ocupados,
  onEscolher,
}: {
  data: string;
  ocupados: Set<string> | null;
  onEscolher: (h: string) => void;
}) {
  if (!ocupados) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {horariosDoDia().map((h) => (
          <div key={h} className="h-12 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const horarios = horariosDoDia().map((h) => ({ h, reservado: ocupados.has(h), passou: horarioPassou(data, h) }));
  const livres = horarios.filter((x) => !x.reservado && !x.passou).length;

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {horarios.map(({ h, reservado, passou }) => (
          <button
            key={h}
            disabled={reservado || passou}
            onClick={() => onEscolher(h)}
            className={`h-12 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center leading-tight ${
              reservado
                ? "border-transparent bg-muted text-muted-foreground/60 cursor-not-allowed"
                : passou
                  ? "border-transparent text-muted-foreground/35 cursor-not-allowed"
                  : "border-border bg-card hover:border-primary hover:text-primary hover:bg-primary/5"
            }`}
          >
            <span className={reservado ? "line-through" : ""}>{h}</span>
            {reservado && <span className="text-[10px] font-medium no-underline">Reservado</span>}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-xs text-muted-foreground">
        <span>
          {livres > 0 ? (
            <>
              <b className="text-foreground">{livres}</b> horários livres · atualiza sozinho em tempo real
            </>
          ) : (
            "Nenhum horário livre neste dia. Tente outra data ou entre na fila de chegada."
          )}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-border bg-card" /> Livre
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-muted" /> Reservado
          </span>
        </span>
      </div>
    </>
  );
}

function Sucesso({ ag }: { ag: TipoAgendamento }) {
  const msg = `Olá! Acabei de agendar pelo site:\n✂️ ${ag.servicoNome}\n📅 ${formatarData(ag.data, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  })}\n🕐 ${ag.hora}\nNome: ${ag.nome}`;

  return (
    <div className={`${cartao} p-6 md:p-10 text-center animate-fade-in`}>
      <span className="inline-grid place-items-center h-16 w-16 rounded-full bg-success/15 text-success mb-4">
        <CircleCheck className="h-9 w-9" />
      </span>
      <h1 className="font-heading text-2xl md:text-3xl font-bold">Horário confirmado!</h1>
      <p className="text-muted-foreground mt-2">Te esperamos na barbearia 💈</p>

      <div className="bg-muted/60 rounded-2xl p-5 my-6 text-left max-w-sm mx-auto space-y-3">
        <Linha rotulo="Serviço" valor={ag.servicoNome} />
        <Linha rotulo="Data" valor={formatarData(ag.data)} />
        <Linha rotulo="Horário" valor={ag.hora} />
        <Linha rotulo="Valor" valor={formatarPreco(ag.preco)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`https://wa.me/${BARBEARIA.whatsapp}?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btn("contorno", "lg")}
        >
          <MessageCircle className="h-4 w-4 text-success" /> Avisar no WhatsApp
        </a>
        <Link href="/meus-horarios/" className={btn("primario", "lg")}>
          Meus horários <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Titulo({ t, s }: { t: string; s: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold mb-1">{t}</h2>
      <p className="text-muted-foreground text-sm">{s}</p>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="font-semibold text-right">{valor}</span>
    </div>
  );
}

function Alerta({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">{children}</div>;
}
