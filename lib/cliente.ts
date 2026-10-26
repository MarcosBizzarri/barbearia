"use client";

import { useSyncExternalStore } from "react";

const nada = () => () => {};

/** false durante a geração estática (build), true no navegador. */
export function useNoCliente(): boolean {
  return useSyncExternalStore(nada, () => true, () => false);
}

// Tema claro/escuro: a classe "dark" no <html> é a fonte da verdade
const ouvintesTema = new Set<() => void>();

export function useTemaEscuro(): boolean {
  return useSyncExternalStore(
    (f) => {
      ouvintesTema.add(f);
      return () => ouvintesTema.delete(f);
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function alternarTema() {
  const escuro = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("tema", escuro ? "dark" : "light");
  } catch {}
  ouvintesTema.forEach((f) => f());
}
