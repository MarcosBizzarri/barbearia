# Barbearia Alexandre Monteiro: agendamento online

Site da barbearia com:

- **Agendamento online**: o cliente escolhe serviço, dia e horário (das 09:00 às 19:00, de 30 em 30 min). Horário reservado fica bloqueado **na hora** para todo mundo e o banco garante que duas pessoas nunca pegam o mesmo horário.
- **Fila de chegada**: quem não agendou entra na fila pelo celular e acompanha a posição em tempo real.
- **Login e cadastro**: só aparecem quando a pessoa clica em **Entrar** ou vai confirmar um horário.
- **Painel do barbeiro**: agenda do dia, faturamento previsto, botão de WhatsApp do cliente, cancelar, encaixar cliente do balcão, bloquear horário (almoço/folga) e controle da fila ("Chamar próximo").
- Tema claro/escuro, funciona bem no celular.

Feito com Next.js (site estático) e Firebase (Authentication, Firestore e Hosting).

---

## 1. Testar no computador (sem Firebase)

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem configurar o Firebase, o site roda em **modo demonstração**: os dados ficam salvos só no navegador.

- Painel do barbeiro: entre com `admin@demo.com` / senha `123456`.
- Para simular dois clientes, abra duas abas. Quando um reserva, o horário some na outra.

## 2. Personalizar

Tudo fica em [`lib/config.ts`](lib/config.ts): nome, endereço, WhatsApp, serviços e preços, produtos, horário de funcionamento, dias fechados (domingo por padrão) e quantos dias à frente dá para agendar.

**Fotos da galeria**: coloque os arquivos em `public/galeria/` com os nomes `1.jpg`, `2.jpg`... `6.jpg` (ou edite a lista `GALERIA` no config).

## 3. Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com e crie um projeto.
2. **Authentication** → *Começar* → ative **E-mail/senha**.
3. **Firestore Database** → *Criar banco de dados* → modo de produção → região `southamerica-east1` (São Paulo).
4. **Configurações do projeto** (engrenagem) → *Seus apps* → ícone **Web** `</>` → registre o app e copie a configuração.
5. Copie `.env.example` para `.env.local` e preencha com esses valores.

## 4. Publicar

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # escolha o projeto criado
npm run deploy                # gera o site e publica site + regras de segurança
```

O endereço aparece no final (ex.: `https://seu-projeto.web.app`). Para usar domínio próprio: Hosting → *Adicionar domínio personalizado*.

## 5. Tornar o Alexandre administrador

1. O Alexandre cria a conta normalmente pelo site (botão **Entrar** → **Cadastrar**).
2. No console do Firebase: **Authentication** → copie o **UID** da conta dele.
3. **Firestore** → *Iniciar coleção* `admins` → ID do documento = **o UID copiado** → adicione um campo qualquer (ex.: `nome: "Alexandre"`).
4. Ele sai e entra de novo no site: aparece o botão **Painel**.

---

## Como a reserva é protegida

Cada horário vira um documento `horarios/AAAA-MM-DD_HHMM`. As regras do Firestore ([`firestore.rules`](firestore.rules)) só permitem **criar** esse documento, nunca sobrescrever. Então, se duas pessoas clicarem no mesmo horário ao mesmo tempo, só a primeira consegue e a segunda recebe o aviso "esse horário acabou de ser reservado". Isso vale até para quem tentar burlar o site.

Outras regras: o cliente só vê e cancela os **próprios** agendamentos (telefone e nome não ficam expostos), só o administrador vê a agenda completa e mexe na fila, e ninguém consegue se tornar administrador pelo site.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `app/page.tsx` | Página inicial |
| `app/agendar/` | Fluxo de agendamento (serviço → data → horário → confirmar) |
| `app/entrar/` | Login e cadastro |
| `app/fila/` | Fila de chegada |
| `app/meus-horarios/` | Horários do cliente (cancelar) |
| `app/painel/` | Painel do barbeiro |
| `lib/config.ts` | **Configurações da barbearia** |
| `lib/backend-firebase.ts` | Acesso ao Firebase |
| `lib/backend-demo.ts` | Modo demonstração (localStorage) |
| `firestore.rules` | Regras de segurança do banco |
| `scripts/corrigir-export.mjs` | Ajuste pós-build para a navegação funcionar em hospedagem estática |
