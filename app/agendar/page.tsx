import { Suspense } from "react";
import { Agendamento } from "./Agendamento";

export const metadata = { title: "Agendar horário" };

export default function PaginaAgendar() {
  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <Suspense>
        <Agendamento />
      </Suspense>
    </div>
  );
}
