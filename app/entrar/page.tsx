import { Suspense } from "react";
import { FormularioEntrar } from "./FormularioEntrar";

export const metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <div className="flex-1 grid place-items-center px-4 py-10 md:py-16 bg-secondary/40">
      <Suspense>
        <FormularioEntrar />
      </Suspense>
    </div>
  );
}
