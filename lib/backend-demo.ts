// Modo demonstração: tudo fica salvo no navegador (localStorage).
// Serve para testar o sistema antes de configurar o Firebase.
// Abra duas abas para simular dois clientes disputando o mesmo horário.

import { hoje, idHorario } from "./datas";
import {
  ErroHorarioOcupado,
  ordenarAgendamentos,
  ordenarFila,
  primeiroNome,
  type Agendamento,
  type Backend,
  type ItemFila,
  type Usuario,
} from "./tipos";

type Conta = Omit<Usuario, "admin"> & { senha: string };
type Banco = {
  contas: Record<string, Conta>;
  sessao: string | null;
  agendamentos: Record<string, Agendamento>;
  fila: Record<string, ItemFila>;
};

const CHAVE = "barbearia-demo-v1";
export const ADMIN_DEMO = { email: "admin@demo.com", senha: "123456" };

const vazio = (): Banco => ({
  contas: {
    "admin-demo": {
      uid: "admin-demo",
      nome: "Alexandre Monteiro",
      email: ADMIN_DEMO.email,
      telefone: "",
      senha: ADMIN_DEMO.senha,
    },
  },
  sessao: null,
  agendamentos: {},
  fila: {},
});

function ler(): Banco {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return JSON.parse(bruto) as Banco;
  } catch {}
  return vazio();
}

const ouvintes = new Set<() => void>();

function gravar(alterar: (b: Banco) => void) {
  const b = ler();
  alterar(b);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(b));
  } catch {}
  ouvintes.forEach((f) => f());
}

function ouvir(f: () => void) {
  ouvintes.add(f);
  f();
  return () => void ouvintes.delete(f);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CHAVE) ouvintes.forEach((f) => f());
  });
}

class ErroAuth extends Error {
  constructor(public code: string) {
    super(code);
  }
}

const espera = () => new Promise((r) => setTimeout(r, 350));

function usuarioDaSessao(b: Banco): Usuario | null {
  const c = b.sessao ? b.contas[b.sessao] : undefined;
  if (!c) return null;
  return { uid: c.uid, nome: c.nome, email: c.email, telefone: c.telefone, admin: c.email === ADMIN_DEMO.email };
}

export function criarBackendDemo(): Backend {
  return {
    demo: true,

    ouvirUsuario(cb) {
      return ouvir(() => cb(usuarioDaSessao(ler())));
    },

    async entrar(email, senha) {
      await espera();
      const c = Object.values(ler().contas).find((c) => c.email === email.trim().toLowerCase());
      if (!c || c.senha !== senha) throw new ErroAuth("auth/invalid-credential");
      gravar((b) => (b.sessao = c.uid));
    },

    async cadastrar({ nome, telefone, email, senha }) {
      await espera();
      email = email.trim().toLowerCase();
      if (Object.values(ler().contas).some((c) => c.email === email)) {
        throw new ErroAuth("auth/email-already-in-use");
      }
      if (senha.length < 6) throw new ErroAuth("auth/weak-password");
      const uid = `u${Date.now()}`;
      gravar((b) => {
        b.contas[uid] = { uid, nome, telefone, email, senha };
        b.sessao = uid;
      });
    },

    async recuperarSenha() {
      await espera();
    },

    async sair() {
      gravar((b) => (b.sessao = null));
    },

    ouvirOcupados(data, cb) {
      return ouvir(() =>
        cb(new Set(Object.values(ler().agendamentos).filter((a) => a.data === data).map((a) => a.hora))),
      );
    },

    async agendar(u, { data, hora, servico }) {
      await espera();
      const id = idHorario(data, hora);
      if (ler().agendamentos[id]) throw new ErroHorarioOcupado();
      const ag: Agendamento = {
        id,
        uid: u.uid,
        nome: u.nome,
        telefone: u.telefone,
        servicoId: servico.id,
        servicoNome: servico.nome,
        preco: servico.preco,
        data,
        hora,
        criadoEm: Date.now(),
      };
      gravar((b) => (b.agendamentos[id] = ag));
      return ag;
    },

    ouvirMeusAgendamentos(uid, cb) {
      return ouvir(() =>
        cb(ordenarAgendamentos(Object.values(ler().agendamentos).filter((a) => a.uid === uid))),
      );
    },

    async cancelar(a) {
      gravar((b) => delete b.agendamentos[a.id]);
    },

    ouvirAgendaDoDia(data, cb) {
      return ouvir(() =>
        cb(ordenarAgendamentos(Object.values(ler().agendamentos).filter((a) => a.data === data))),
      );
    },

    ouvirFila(data, cb) {
      return ouvir(() => cb(ordenarFila(Object.values(ler().fila).filter((f) => f.data === data))));
    },

    async entrarNaFila(u) {
      const data = hoje();
      const id = `${data}_${u.uid}`;
      gravar((b) => {
        b.fila[id] = { id, uid: u.uid, nome: primeiroNome(u.nome), data, status: "aguardando", criadoEm: Date.now() };
      });
    },

    async sairDaFila(item) {
      gravar((b) => delete b.fila[item.id]);
    },

    async adicionarNaFila(nome, adminUid) {
      const data = hoje();
      const id = `${data}_avulso_${Date.now()}`;
      gravar((b) => {
        b.fila[id] = { id, uid: adminUid, nome: nome.trim(), data, status: "aguardando", criadoEm: Date.now() };
      });
    },

    async mudarStatusFila(item, status) {
      gravar((b) => {
        if (b.fila[item.id]) b.fila[item.id].status = status;
      });
    },
  };
}
