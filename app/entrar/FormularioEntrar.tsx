"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Info, LoaderCircle, Lock, Mail, Phone, Scissors, User } from "lucide-react";
import { btn, campo, cartao } from "@/components/ui";
import { ADMIN_DEMO } from "@/lib/backend-demo";
import { BARBEARIA } from "@/lib/config";
import { api, mensagemErro, modoDemo, useUsuario } from "@/lib/dados";

type Aba = "entrar" | "cadastrar";

function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Só aceita caminhos internos para não virar redirecionamento aberto */
function destinoSeguro(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

export function FormularioEntrar() {
  const params = useSearchParams();
  const router = useRouter();
  const usuario = useUsuario();
  const voltar = destinoSeguro(params.get("voltar"));

  const [aba, setAba] = useState<Aba>(params.get("aba") === "cadastrar" ? "cadastrar" : "entrar");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (usuario) router.replace(voltar);
  }, [usuario, router, voltar]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    if (aba === "cadastrar") {
      if (nome.trim().split(/\s+/).length < 2) return setErro("Informe nome e sobrenome.");
      if (telefone.replace(/\D/g, "").length < 10) return setErro("Informe um telefone com DDD.");
    }
    setEnviando(true);
    try {
      if (aba === "entrar") await api().entrar(email.trim(), senha);
      else await api().cadastrar({ nome: nome.trim(), telefone, email: email.trim(), senha });
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function recuperar() {
    setErro("");
    if (!email.includes("@")) return setErro("Digite seu e-mail acima para recuperar a senha.");
    try {
      await api().recuperarSenha(email.trim());
      setAviso("Enviamos um link para redefinir sua senha. Confira seu e-mail (e o spam).");
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  return (
    <div className={`${cartao} w-full max-w-md p-6 md:p-8 shadow-xl shadow-black/5 animate-fade-in`}>
      <div className="text-center mb-6">
        <span className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white mb-3">
          <Scissors className="h-6 w-6" />
        </span>
        <h1 className="font-heading text-2xl font-bold">
          {aba === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {aba === "entrar" ? `Entre para agendar na ${BARBEARIA.nome}` : "Leva menos de 1 minuto"}
        </p>
      </div>

      <div className="grid grid-cols-2 p-1 rounded-xl bg-muted mb-6" role="tablist">
        {(["entrar", "cadastrar"] as const).map((a) => (
          <button
            key={a}
            role="tab"
            aria-selected={aba === a}
            onClick={() => {
              setAba(a);
              setErro("");
              setAviso("");
            }}
            className={`h-9 rounded-lg text-sm font-semibold transition-all ${
              aba === a ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {a === "entrar" ? "Entrar" : "Cadastrar"}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="space-y-4">
        {aba === "cadastrar" && (
          <>
            <Campo icone={<User />} rotulo="Nome completo">
              <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João da Silva" autoComplete="name" required />
            </Campo>
            <Campo icone={<Phone />} rotulo="WhatsApp">
              <input
                className={campo}
                value={telefone}
                onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </Campo>
          </>
        )}
        <Campo icone={<Mail />} rotulo="E-mail">
          <input className={campo} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" required />
        </Campo>
        <Campo icone={<Lock />} rotulo="Senha">
          <input
            className={campo}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder={aba === "cadastrar" ? "Mínimo 6 caracteres" : "Sua senha"}
            autoComplete={aba === "entrar" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </Campo>

        {aba === "entrar" && (
          <button type="button" onClick={recuperar} className="text-xs text-primary font-semibold hover:underline">
            Esqueci minha senha
          </button>
        )}

        {erro && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{erro}</p>}
        {aviso && <p className="text-sm text-success bg-success/10 rounded-lg px-3 py-2">{aviso}</p>}

        <button type="submit" disabled={enviando} className={btn("primario", "lg", "w-full")}>
          {enviando && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {aba === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {aba === "entrar" ? "Ainda não tem conta? " : "Já tem conta? "}
        <button onClick={() => setAba(aba === "entrar" ? "cadastrar" : "entrar")} className="text-primary font-semibold hover:underline">
          {aba === "entrar" ? "Cadastre-se" : "Entrar"}
        </button>
      </p>

      {modoDemo && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs flex gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            <b>Modo demonstração.</b> Para ver o painel do barbeiro, entre com <b>{ADMIN_DEMO.email}</b> / senha{" "}
            <b>{ADMIN_DEMO.senha}</b>. Clientes podem se cadastrar normalmente.
          </p>
        </div>
      )}

      <p className="text-center mt-4">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Voltar ao início
        </Link>
      </p>
    </div>
  );
}

function Campo({ icone, rotulo, children }: { icone: ReactNode; rotulo: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{rotulo}</span>
      <span className="relative block [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-muted-foreground">
        {icone}
        {children}
      </span>
    </label>
  );
}
