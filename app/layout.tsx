import type { Metadata } from "next";
import { Nunito_Sans, Playfair_Display } from "next/font/google";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { BARBEARIA } from "@/lib/config";
import "./globals.css";

const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: BARBEARIA.nome,
  description: "Agende seu horário em poucos cliques. Sem espera, sem complicação.",
};

// Aplica o tema salvo antes da página aparecer (evita "piscar" claro/escuro)
const scriptTema = `try{var t=localStorage.getItem('tema');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${nunito.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Cabecalho />
        <main className="flex-1 flex flex-col">{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
