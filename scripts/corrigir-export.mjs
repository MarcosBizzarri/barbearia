// Pós-build: o Next 16 grava os dados de navegação em "rota/__next.rota/__PAGE__.txt",
// mas o navegador busca "rota/__next.rota.__PAGE__.txt". Em hospedagem estática
// (Firebase Hosting) isso dá 404 e cada clique vira recarga completa da página.
// Aqui criamos uma cópia de cada arquivo no caminho "achatado" que o navegador pede.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
let copias = 0;

function arquivos(dir, prefixo = "") {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho, `${prefixo}${nome}.`) : [[caminho, prefixo + nome]];
  });
}

function percorrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (!statSync(caminho).isDirectory()) continue;
    if (nome.startsWith("__next.")) {
      for (const [origem, achatado] of arquivos(caminho, `${nome}.`)) {
        const destino = join(dir, achatado);
        if (!existsSync(destino)) {
          copyFileSync(origem, destino);
          copias++;
        }
      }
    } else {
      percorrer(caminho);
    }
  }
}

if (!existsSync(OUT)) {
  console.error("Pasta out/ não encontrada. Rode `next build` antes.");
  process.exit(1);
}
percorrer(OUT);
console.log(`corrigir-export: ${copias} arquivo(s) de navegação ajustado(s).`);
