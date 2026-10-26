import { MessageCircle } from "lucide-react";
import { BARBEARIA } from "@/lib/config";

/** Botão flutuante para falar com a barbearia (agendamentos e dúvidas). */
export function BotaoWhatsApp() {
  const msg = "Olá! Vim pelo site e gostaria de falar sobre um agendamento.";
  return (
    <a
      href={`https://wa.me/${BARBEARIA.whatsapp}?text=${encodeURIComponent(msg)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar no WhatsApp ${BARBEARIA.telefoneExibicao}`}
      title={`WhatsApp ${BARBEARIA.telefoneExibicao}`}
      className="fixed bottom-5 right-5 z-40 grid place-items-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 hover:scale-105 transition-transform"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
