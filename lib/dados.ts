"use client";

import { useEffect, useState } from "react";
import { criarBackendDemo } from "./backend-demo";
import { criarBackendFirebase } from "./backend-firebase";
import type { Backend, Usuario } from "./tipos";

// Preencha o arquivo .env.local (veja .env.example). Sem ele, o site roda em modo demonstração.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let backend: Backend | null = null;

/** Só chame no navegador (dentro de useEffect ou handlers). */
export function api(): Backend {
  if (!backend) {
    backend =
      firebaseConfig.apiKey && firebaseConfig.projectId
        ? criarBackendFirebase(firebaseConfig)
        : criarBackendDemo();
  }
  return backend;
}

export const modoDemo = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/** undefined = carregando, null = não logado */
export function useUsuario(): Usuario | null | undefined {
  const [u, setU] = useState<Usuario | null | undefined>(undefined);
  useEffect(() => api().ouvirUsuario(setU), []);
  return u;
}

const MENSAGENS: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Faça login.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão com a internet.",
  "permission-denied": "Você não tem permissão para fazer isso.",
};

export function mensagemErro(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code && MENSAGENS[code]) return MENSAGENS[code];
  if (e instanceof Error && !code) return e.message;
  return "Algo deu errado. Tente novamente.";
}
