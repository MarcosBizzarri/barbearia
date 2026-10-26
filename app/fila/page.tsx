"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, LoaderCircle, LogIn, Scissors, Users } from "lucide-react";
import { btn, cartao } from "@/components/ui";
import { useNoCliente } from "@/lib/cliente";
import { api, mensagemErro, useUsuario } from "@/lib/dados";
import { diaAberto, hoje } from "@/lib/datas";
import type { ItemFila } from "@/lib/tipos";

/** Tempo médio por atendimento, usado só para a estimativa de espera */
const MINUTOS_POR_CLIENTE = 30;

export default function PaginaFila() {
  const usuario = useUsuario();
  const [fila, setFila] = useState<ItemFila[] | null>(null);
  const aberto = !useNoCliente() || diaAberto(new Date());
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => api().ouvirFila(hoje(), setFila), []);

  const atendendo = fila?.filter((i) => i.status === "atendendo") ?? [];
  const aguardando = fila?.filter((i) => i.status === "aguardando") ?? [];
  const minhaPosicao = usuario ? aguardando.findIndex((i) => i.id === `${hoje()}_${usuario.uid}`) : -1;
  const meuItem = minhaPosicao >= 0 ? aguardando[minhaPosicao] : usuario ? atendendo.find((i) => i.id === `${hoje()}_${usuario.uid}`) : undefined;

  async function agir(acao: () => Promise<void>) {
    setOcupado(true);
    setErro("");
    try {
      await acao();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">
          Fila de <span className="text-gradient">chegada</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Não agendou? Entre na fila pelo celular e acompanhe sua vez em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`${cartao} p-5 text-center`}>
          <Users className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="font-heading text-3xl font-bold">{fila ? aguardando.length : "–"}</p>
          <p className="text-xs text-muted-foreground">aguardando</p>
        </div>
        <div className={`${cartao} p-5 text-center`}>
          <Clock className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="font-heading text-3xl font-bold">~{fila ? aguardando.length * MINUTOS_POR_CLIENTE : "–"}</p>
          <p className="text-xs text-muted-foreground">minutos de espera estimada</p>
        </div>
      </div>

      {/* Ação do cliente */}
      <div className={`${cartao} p-5 md:p-6 mb-6`}>
        {!aberto ? (
          <p className="text-center text-muted-foreground">Hoje a barbearia está fechada. Agende para outro dia!</p>
        ) : usuario === undefined ? (
          <div className="h-12 rounded-xl bg-muted animate-pulse" />
        ) : usuario === null ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Entre na sua conta para pegar seu lugar na fila.</p>
            <Link href="/entrar/?voltar=%2Ffila%2F" className={btn("primario", "lg")}>
              <LogIn className="h-4 w-4" /> Entrar para pegar a fila
            </Link>
          </div>
        ) : meuItem?.status === "atendendo" ? (
          <p className="text-center font-heading text-xl font-bold text-success">É a sua vez! Pode sentar na cadeira 💈</p>
        ) : meuItem ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Sua posição</p>
            <p className="font-heading text-6xl font-bold text-primary my-1">{minhaPosicao + 1}º</p>
            <p className="text-sm text-muted-foreground mb-4">
              {minhaPosicao === 0 ? "Você é o próximo! Já pode vir." : `${minhaPosicao} pessoa(s) na sua frente`}
            </p>
            <button disabled={ocupado} onClick={() => agir(() => api().sairDaFila(meuItem))} className={btn("perigo", "sm")}>
              Sair da fila
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button disabled={ocupado || !fila} onClick={() => agir(() => api().entrarNaFila(usuario))} className={btn("primario", "lg")}>
              {ocupado ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Entrar na fila
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              Prefere hora marcada?{" "}
              <Link href="/agendar/" className="text-primary font-semibold hover:underline">
                Agende aqui
              </Link>
            </p>
          </div>
        )}
        {erro && <p className="text-sm text-destructive text-center mt-3">{erro}</p>}
      </div>

      {/* Lista pública (só o primeiro nome) */}
      {fila && fila.length > 0 && (
        <div className={`${cartao} divide-y divide-border overflow-hidden`}>
          {atendendo.map((i) => (
            <div key={i.id} className="flex items-center gap-3 px-5 py-3 bg-success/10">
              <Scissors className="h-4 w-4 text-success" />
              <span className="font-semibold flex-1">{i.nome}</span>
              <span className="text-xs font-semibold text-success">Na cadeira</span>
            </div>
          ))}
          {aguardando.map((i, n) => (
            <div key={i.id} className={`flex items-center gap-3 px-5 py-3 ${meuItem?.id === i.id ? "bg-primary/5 font-semibold" : ""}`}>
              <span className="w-7 h-7 rounded-full bg-muted grid place-items-center text-xs font-bold">{n + 1}</span>
              <span className="flex-1">{i.nome}</span>
              <span className="text-xs text-muted-foreground">
                desde {new Date(i.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
