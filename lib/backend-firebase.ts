import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
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

export function criarBackendFirebase(config: FirebaseOptions): Backend {
  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const ouvintesUsuario = new Set<(u: Usuario | null) => void>();
  let usuarioAtual: Usuario | null = null;

  async function montarUsuario(user: User): Promise<Usuario> {
    const [perfil, admin] = await Promise.all([
      getDoc(doc(db, "usuarios", user.uid)),
      getDoc(doc(db, "admins", user.uid)).catch(() => null),
    ]);
    const p = perfil.data() ?? {};
    return {
      uid: user.uid,
      nome: p.nome ?? user.displayName ?? "",
      telefone: p.telefone ?? "",
      email: user.email ?? "",
      admin: !!admin?.exists(),
    };
  }

  async function atualizarUsuario(user: User | null) {
    usuarioAtual = user ? await montarUsuario(user) : null;
    ouvintesUsuario.forEach((cb) => cb(usuarioAtual));
  }

  onAuthStateChanged(auth, (user) => void atualizarUsuario(user));

  return {
    demo: false,

    ouvirUsuario(cb) {
      ouvintesUsuario.add(cb);
      // Primeira resposta só depois que o Firebase restaurar a sessão
      void auth.authStateReady().then(() => {
        if (ouvintesUsuario.has(cb) && (usuarioAtual || !auth.currentUser)) cb(usuarioAtual);
      });
      return () => ouvintesUsuario.delete(cb);
    },

    async entrar(email, senha) {
      await signInWithEmailAndPassword(auth, email, senha);
    },

    async cadastrar({ nome, telefone, email, senha }) {
      const { user } = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(user, { displayName: nome });
      await setDoc(doc(db, "usuarios", user.uid), { nome, telefone, email, criadoEm: Date.now() });
      await atualizarUsuario(user);
    },

    async recuperarSenha(email) {
      await sendPasswordResetEmail(auth, email);
    },

    async sair() {
      await signOut(auth);
    },

    ouvirOcupados(data, cb) {
      const q = query(collection(db, "horarios"), where("data", "==", data));
      return onSnapshot(q, (snap) => cb(new Set(snap.docs.map((d) => d.data().hora as string))));
    },

    async agendar(u, { data, hora, servico }) {
      const id = idHorario(data, hora);
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
      try {
        await runTransaction(db, async (tx) => {
          const trava = await tx.get(doc(db, "horarios", id));
          if (trava.exists()) throw new ErroHorarioOcupado();
          tx.set(doc(db, "horarios", id), { data, hora, uid: u.uid });
          const { id: _id, ...dados } = ag; // eslint-disable-line @typescript-eslint/no-unused-vars
          tx.set(doc(db, "agendamentos", id), dados);
        });
      } catch (e) {
        // As regras do Firestore negam a escrita se o horário já existir
        if (e instanceof ErroHorarioOcupado || (e as { code?: string }).code === "permission-denied") {
          throw new ErroHorarioOcupado();
        }
        throw e;
      }
      return ag;
    },

    ouvirMeusAgendamentos(uid, cb) {
      const q = query(collection(db, "agendamentos"), where("uid", "==", uid));
      return onSnapshot(q, (snap) =>
        cb(ordenarAgendamentos(snap.docs.map((d) => ({ ...(d.data() as Agendamento), id: d.id })))),
      );
    },

    async cancelar(a) {
      const lote = writeBatch(db);
      lote.delete(doc(db, "agendamentos", a.id));
      lote.delete(doc(db, "horarios", a.id));
      await lote.commit();
    },

    ouvirAgendaDoDia(data, cb) {
      const q = query(collection(db, "agendamentos"), where("data", "==", data));
      return onSnapshot(q, (snap) =>
        cb(ordenarAgendamentos(snap.docs.map((d) => ({ ...(d.data() as Agendamento), id: d.id })))),
      );
    },

    ouvirFila(data, cb) {
      const q = query(collection(db, "fila"), where("data", "==", data));
      return onSnapshot(q, (snap) =>
        cb(ordenarFila(snap.docs.map((d) => ({ ...(d.data() as ItemFila), id: d.id })))),
      );
    },

    async entrarNaFila(u) {
      const data = hoje();
      await setDoc(doc(db, "fila", `${data}_${u.uid}`), {
        uid: u.uid,
        nome: primeiroNome(u.nome),
        data,
        status: "aguardando",
        criadoEm: Date.now(),
      });
    },

    async sairDaFila(item) {
      await deleteDoc(doc(db, "fila", item.id));
    },

    async adicionarNaFila(nome, adminUid) {
      const data = hoje();
      await setDoc(doc(db, "fila", `${data}_avulso_${Date.now()}`), {
        uid: adminUid,
        nome: nome.trim(),
        data,
        status: "aguardando",
        criadoEm: Date.now(),
      });
    },

    async mudarStatusFila(item, status) {
      await updateDoc(doc(db, "fila", item.id), { status });
    },
  };
}
