import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import {
  collection,
  DocumentData,
  doc,
  onSnapshot,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Notificacao = {
  id: string;
  tipo?: 'intencao_adocao';
  status?: 'pendente' | 'recusada' | 'em_negociacao' | 'aprovada';
  petId?: string;
  petNome?: string;
  donoId?: string;
  donoNome?: string;
  adotanteId?: string;
  adotanteNome?: string;
  chatId?: string | null;
  mensagemAdotante?: string;
  createdAt?: Timestamp;
};

type TipoChat = 'negociacao' | 'transferencia';

export default function Notificacoes() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const usuarioLogado = auth.currentUser;

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setNotificacoes([]);
      setCarregando(false);
      return;
    }

    const notificacoesRef = collection(db, 'notificacoes');
    const notificacoesDonoQuery = query(notificacoesRef, where('donoId', '==', user.uid));
    const notificacoesAdotanteQuery = query(notificacoesRef, where('adotanteId', '==', user.uid));

    let notificacoesDono: Notificacao[] = [];
    let notificacoesAdotante: Notificacao[] = [];

    const atualizarLista = () => {
      const mapa = new Map<string, Notificacao>();

      [...notificacoesDono, ...notificacoesAdotante].forEach((notificacao) => {
        mapa.set(notificacao.id, notificacao);
      });

      const lista = Array.from(mapa.values()).sort((a, b) => {
        const dataA = a.createdAt?.toMillis() || 0;
        const dataB = b.createdAt?.toMillis() || 0;
        return dataB - dataA;
      });

      setNotificacoes(lista);
      setCarregando(false);
    };

    const tratarSnapshot = (tipoLista: 'dono' | 'adotante') => (
      snapshot: QuerySnapshot<DocumentData>
    ) => {
      const lista = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...(documento.data() as Omit<Notificacao, 'id'>),
      }));

      if (tipoLista === 'dono') {
        notificacoesDono = lista;
      } else {
        notificacoesAdotante = lista;
      }

      atualizarLista();
    };

    const tratarErro = (error: unknown) => {
      console.log('Erro ao carregar notificacoes:', error);
      setCarregando(false);
    };

    const unsubscribeDono = onSnapshot(notificacoesDonoQuery, tratarSnapshot('dono'), tratarErro);
    const unsubscribeAdotante = onSnapshot(
      notificacoesAdotanteQuery,
      tratarSnapshot('adotante'),
      tratarErro
    );

    return () => {
      unsubscribeDono();
      unsubscribeAdotante();
    };
  }, []);

  const renderMensagem = (notificacao: Notificacao) => {
    const user = auth.currentUser;
    const donoNome = notificacao.donoNome || 'Usuario';
    const adotanteNome = notificacao.adotanteNome || 'Alguem';
    const petNome = notificacao.petNome || 'seu pet';

    if (user?.uid === notificacao.adotanteId) {
      if (notificacao.mensagemAdotante) {
        return notificacao.mensagemAdotante;
      }

      if (notificacao.status === 'recusada') {
        return `Usuario ${donoNome} recusou sua intencao de adocao.`;
      }

      if (notificacao.status === 'em_negociacao') {
        return `Usuario ${donoNome} aceitou negociar o pet ${petNome} com voce.`;
      }

      if (notificacao.status === 'aprovada') {
        return `Parabens! Usuario ${donoNome} aceitou doar o pet ${petNome} para voce! Abra o chat para tratar da transferencia do animal para sua posse.`;
      }
    }

    if (notificacao.tipo === 'intencao_adocao') {
      return `${adotanteNome} deseja adotar ${petNome}`;
    }

    return 'Nova notificacao';
  };

  const montarMensagemAdotante = (
    notificacao: Notificacao,
    status: 'recusada' | 'em_negociacao' | 'aprovada'
  ) => {
    const donoNome = notificacao.donoNome || 'Usuario';
    const petNome = notificacao.petNome || 'seu pet';

    if (status === 'recusada') {
      return `Usuario ${donoNome} recusou sua intencao de adocao.`;
    }

    if (status === 'em_negociacao') {
      return `Usuario ${donoNome} aceitou negociar o pet ${petNome} com voce.`;
    }

    return `Parabens! Usuario ${donoNome} aceitou doar o pet ${petNome} para voce! Abra o chat para tratar da transferencia do animal para sua posse.`;
  };

  const criarOuAtualizarChat = async (notificacao: Notificacao, tipoChat: TipoChat) => {
    if (!notificacao.petId || !notificacao.donoId || !notificacao.adotanteId) {
      throw new Error('Notificacao sem dados suficientes para criar chat.');
    }

    const chatId = notificacao.chatId || `${notificacao.petId}_${notificacao.adotanteId}`;

    await setDoc(
      doc(db, 'chats', chatId),
      {
        animalId: notificacao.petId,
        animalNome: notificacao.petNome || 'Animal',
        ownerId: notificacao.donoId,
        interessadoId: notificacao.adotanteId,
        participantes: [notificacao.donoId, notificacao.adotanteId],
        donoNome: notificacao.donoNome || 'Usuario',
        interessadoNome: notificacao.adotanteNome || 'Usuario',
        tipo_chat: tipoChat,
        createdAt: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return chatId;
  };

  const atualizarStatus = async (
    notificacao: Notificacao,
    status: 'recusada' | 'em_negociacao' | 'aprovada'
  ) => {
    if (processandoId) return;

    try {
      setProcessandoId(notificacao.id);

      const dadosAtualizacao: Record<string, unknown> = {
        status,
        mensagemAdotante: montarMensagemAdotante(notificacao, status),
        updatedAt: serverTimestamp(),
      };

      if (status === 'em_negociacao' || status === 'aprovada') {
        dadosAtualizacao.chatId = await criarOuAtualizarChat(
          notificacao,
          status === 'em_negociacao' ? 'negociacao' : 'transferencia'
        );
      }

      await updateDoc(doc(db, 'notificacoes', notificacao.id), dadosAtualizacao);
    } catch (error) {
      console.log('Erro ao atualizar notificacao:', error);
      Alert.alert('Erro', 'Nao foi possivel atualizar esta notificacao agora.');
    } finally {
      setProcessandoId(null);
    }
  };

  const abrirNotificacao = (notificacao: Notificacao) => {
    if (notificacao.chatId) {
      router.push({ pathname: '/(app)/chat', params: { chatId: notificacao.chatId } });
    }
  };

  const renderData = (notificacao: Notificacao) => {
    const data = notificacao.createdAt?.toDate();

    if (!data) {
      return 'Agora';
    }

    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Notificacoes</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#88c9bf" style={styles.loading} />
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma notificacao encontrada.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              activeOpacity={item.chatId ? 0.75 : 1}
              onPress={() => abrirNotificacao(item)}
            >
              <Text style={styles.message}>{renderMensagem(item)}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.status}>{item.status || 'pendente'}</Text>
                <Text style={styles.date}>{renderData(item)}</Text>
              </View>
              {usuarioLogado?.uid === item.donoId && item.status === 'pendente' ? (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => atualizarStatus(item, 'recusada')}
                    disabled={processandoId === item.id}
                  >
                    <Text style={styles.actionText}>Recusar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.negotiateButton]}
                    onPress={() => atualizarStatus(item, 'em_negociacao')}
                    disabled={processandoId === item.id}
                  >
                    <Text style={styles.actionText}>Negociar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => atualizarStatus(item, 'aprovada')}
                    disabled={processandoId === item.id}
                  >
                    <Text style={styles.actionText}>Aceitar</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {item.chatId ? <Text style={styles.openChatText}>Toque para abrir o chat</Text> : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    backgroundColor: '#CFE9E5',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 20 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  loading: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e7e8',
  },
  message: { fontSize: 15, color: '#434343', fontWeight: '500' },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  status: { fontSize: 12, color: '#88c9bf', fontWeight: 'bold' },
  date: { fontSize: 12, color: '#757575' },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: { backgroundColor: '#e6e7e8' },
  negotiateButton: { backgroundColor: '#F2C94C' },
  acceptButton: { backgroundColor: '#88c9bf' },
  actionText: { color: '#434343', fontSize: 12, fontWeight: 'bold' },
  openChatText: {
    color: '#589b9b',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
    marginTop: 32,
    textAlign: 'center',
  },
});
