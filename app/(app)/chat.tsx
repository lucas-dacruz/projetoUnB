import { ROUTES } from '@/constants/routes';
import { auth, db } from '@/services/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CHAT_HEADER_HEIGHT = 90;

type UsuarioResumo = {
  id: string;
  nome: string;
  foto?: string | null;
};

type UsuarioFirestore = {
  nome?: string;
  usuario?: string;
  imagemBase64?: string | null;
};

type ChatResumo = {
  id: string;
  animalId?: string;
  ownerId?: string;
  interessadoId?: string;
  participantes?: string[];
  animalNome?: string;
  ultimoTexto?: string;
  atualizadoEm?: any;
  interessadoNome?: string;
  interessadoFoto?: string | null;
  donoNome?: string;
  donoFoto?: string | null;
  nomeInteressado?: string;
  fotoInteressado?: string | null;
  nomeDono?: string;
  fotoDono?: string | null;
  outroParticipante?: UsuarioResumo;
  tipo_chat?: 'negociacao' | 'transferencia';
};

const normalizarImagem = (imagem?: string | null) => {
  if (!imagem) return null;
  return imagem.startsWith('data:image') ? imagem : `data:image/jpeg;base64,${imagem}`;
};

const criarUsuarioFallback = (id?: string): UsuarioResumo => ({
  id: id || '',
  nome: 'Usuario',
  foto: null,
});

const carregarUsuario = async (uid?: string): Promise<UsuarioResumo> => {
  if (!uid) return criarUsuarioFallback();

  try {
    const usuarioSnap = await getDoc(doc(db, 'usuarios', uid));

    if (!usuarioSnap.exists()) {
      return criarUsuarioFallback(uid);
    }

    const dados = usuarioSnap.data() as UsuarioFirestore;

    return {
      id: uid,
      nome: dados.nome || dados.usuario || 'Usuario',
      foto: normalizarImagem(dados.imagemBase64),
    };
  } catch (error) {
    console.log('Erro ao carregar usuario do chat:', error);
    return criarUsuarioFallback(uid);
  }
};

const obterOutroParticipanteId = (
  chat: ChatResumo | null,
  usuarioId?: string,
  ownerIdParam?: string
) => {
  if (!usuarioId) return ownerIdParam;
  if (chat?.ownerId && chat.ownerId !== usuarioId) return chat.ownerId;
  if (chat?.interessadoId && chat.interessadoId !== usuarioId) return chat.interessadoId;

  const outroId = chat?.participantes?.find((participanteId) => participanteId !== usuarioId);
  return outroId || ownerIdParam;
};

const obterOutroParticipante = (chat: ChatResumo, usuarioId?: string): UsuarioResumo => {
  const outroId = obterOutroParticipanteId(chat, usuarioId);

  if (chat.outroParticipante) {
    return chat.outroParticipante;
  }

  if (outroId && outroId === chat.interessadoId) {
    return {
      id: outroId,
      nome: chat.interessadoNome || chat.nomeInteressado || 'Usuario',
      foto: normalizarImagem(chat.interessadoFoto || chat.fotoInteressado),
    };
  }

  if (outroId && outroId === chat.ownerId) {
    return {
      id: outroId,
      nome: chat.donoNome || chat.nomeDono || 'Usuario',
      foto: normalizarImagem(chat.donoFoto || chat.fotoDono),
    };
  }

  return criarUsuarioFallback(outroId);
};

const obterTipoChat = (chat: ChatResumo) => chat.tipo_chat || 'negociacao';

function AvatarUsuario({ usuario, tamanho = 48 }: { usuario: UsuarioResumo; tamanho?: number }) {
  const inicial = usuario.nome.charAt(0).toUpperCase();

  if (usuario.foto) {
    return (
      <Image
        source={{ uri: usuario.foto }}
        style={[
          styles.avatar,
          { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.avatarFallback,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
      ]}
    >
      <Text style={[styles.avatarInitial, tamanho <= 42 && styles.avatarInitialSmall]}>
        {inicial}
      </Text>
    </View>
  );
}

function ItemConversa({
  chat,
  usuarioId,
  onPress,
}: {
  chat: ChatResumo;
  usuarioId: string;
  onPress: () => void;
}) {
  const outro = obterOutroParticipante(chat, usuarioId);
  const tipoChat = obterTipoChat(chat);
  const tipoChatTexto = tipoChat === 'transferencia' ? 'Transferencia' : 'Negociacao';

  return (
    <TouchableOpacity
      style={[
        styles.chatItem,
        tipoChat === 'transferencia' ? styles.chatTransferencia : styles.chatNegociacao,
      ]}
      onPress={onPress}
    >
      <AvatarUsuario usuario={outro} />
      <View style={styles.chatItemTexts}>
        <View style={styles.chatItemTop}>
          <Text style={styles.chatUserName} numberOfLines={1}>
            {outro.nome}
          </Text>
          {!!chat.animalNome && (
            <Text style={styles.chatAnimalSmall} numberOfLines={1}>
              {chat.animalNome}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.chatType,
            tipoChat === 'transferencia' ? styles.chatTypeTransferencia : styles.chatTypeNegociacao,
          ]}
        >
          {tipoChatTexto}
        </Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {chat.ultimoTexto || 'Conversa iniciada'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TelaChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const usuarioLogado = auth.currentUser;
  const flatListRef = useRef<FlatList<ChatResumo>>(null);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chats, setChats] = useState<ChatResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatAtual, setChatAtual] = useState<ChatResumo | null>(null);
  const [outroParticipante, setOutroParticipante] = useState<UsuarioResumo | null>(null);
  const [perfilUsuarioLogado, setPerfilUsuarioLogado] = useState<UsuarioResumo | null>(null);

  const chatIdParam = params.chatId as string | undefined;
  const scrollToChatId = params.scrollToChatId as string | undefined;
  const animalId = params.animalId as string | undefined;
  const ownerId = params.ownerId as string | undefined;
  const animalNome = params.animalNome as string | undefined;
  const interessadoId = usuarioLogado?.uid;

  const chatId = chatIdParam || (animalId && interessadoId ? `${animalId}_${interessadoId}` : null);
  const exibindoLista = !chatId;

  useEffect(() => {
    if (!usuarioLogado) {
      return;
    }

    carregarUsuario(usuarioLogado.uid).then(setPerfilUsuarioLogado);
  }, [usuarioLogado]);

  useEffect(() => {
    if (!usuarioLogado || !exibindoLista) {
      return;
    }

    setLoading(true);

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participantes', 'array-contains', usuarioLogado.uid));

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const listaChats = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const chat = {
              id: docSnap.id,
              ...docSnap.data(),
            } as ChatResumo;

            const outroId = obterOutroParticipanteId(chat, usuarioLogado.uid);
            const outroComMetadados = obterOutroParticipante(chat, usuarioLogado.uid);

            if (
              outroId &&
              (!outroComMetadados.nome || outroComMetadados.nome === 'Usuario') &&
              !outroComMetadados.foto
            ) {
              chat.outroParticipante = await carregarUsuario(outroId);
            } else {
              chat.outroParticipante = outroComMetadados;
            }

            return chat;
          })
        );

        listaChats.sort((a, b) => {
          const dataA = a.atualizadoEm?.toMillis ? a.atualizadoEm.toMillis() : 0;
          const dataB = b.atualizadoEm?.toMillis ? b.atualizadoEm.toMillis() : 0;
          return dataB - dataA;
        });

        setChats(listaChats);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao listar chats:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [exibindoLista, usuarioLogado]);

  useEffect(() => {
    if (!exibindoLista || !scrollToChatId || chats.length === 0) {
      return;
    }

    const indice = chats.findIndex((chat) => chat.id === scrollToChatId);

    if (indice >= 0) {
      flatListRef.current?.scrollToIndex({ index: indice, animated: true });
    }
  }, [chats, exibindoLista, scrollToChatId]);

  useEffect(() => {
    if (!usuarioLogado || !chatId || exibindoLista) {
      setChatAtual(null);
      setOutroParticipante(null);
      return;
    }

    const chatRef = doc(db, 'chats', chatId);

    const unsubscribe = onSnapshot(
      chatRef,
      async (docSnap) => {
        const dadosChat = docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as ChatResumo)
          : ({
              id: chatId,
              animalId,
              ownerId,
              interessadoId,
              participantes: ownerId && interessadoId ? [ownerId, interessadoId] : undefined,
              animalNome,
            } as ChatResumo);

        const outroId = obterOutroParticipanteId(dadosChat, usuarioLogado.uid, ownerId);
        const outroComMetadados = obterOutroParticipante(dadosChat, usuarioLogado.uid);
        const outro =
          outroId &&
          (!outroComMetadados.nome || outroComMetadados.nome === 'Usuario') &&
          !outroComMetadados.foto
            ? await carregarUsuario(outroId)
            : outroComMetadados;

        setChatAtual(dadosChat);
        setOutroParticipante(outro);
      },
      (error) => {
        console.error('Erro ao carregar dados do chat:', error);
      }
    );

    return () => unsubscribe();
  }, [animalId, animalNome, chatId, exibindoLista, interessadoId, ownerId, usuarioLogado]);

  useEffect(() => {
    if (!usuarioLogado || !chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const mensagensRef = collection(db, 'chats', chatId, 'messages');
    const q = query(mensagensRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const listaMensagens: IMessage[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const dataCriacao = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

          listaMensagens.push({
            _id: docSnap.id,
            text: data.text || '',
            createdAt: dataCriacao,
            user: {
              _id: data.user?._id || '',
              name: data.user?.name || 'Usuario',
              avatar: data.user?.avatar,
            },
          });
        });

        setMessages(listaMensagens);
        setLoading(false);
      },
      (error) => {
        console.error('Erro no listener do onSnapshot:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, usuarioLogado]);

  const onSend = async (novasMensagens: IMessage[] = []) => {
    if (novasMensagens.length === 0) return;
    if (!usuarioLogado || !chatId) return;

    const mensagem = novasMensagens[0];

    try {
      const dadosChat: any = {
        atualizadoEm: serverTimestamp(),
        ultimoTexto: mensagem.text,
        tipo_chat: chatAtual?.tipo_chat || 'negociacao',
      };

      const chatAnimalId = chatAtual?.animalId || animalId;
      const chatOwnerId = chatAtual?.ownerId || ownerId;
      const chatInteressadoId = chatAtual?.interessadoId || interessadoId;
      const chatAnimalNome = chatAtual?.animalNome || animalNome;

      if (chatAnimalId && chatOwnerId && chatInteressadoId) {
        const [perfilInteressado, perfilDono] = await Promise.all([
          carregarUsuario(chatInteressadoId),
          carregarUsuario(chatOwnerId),
        ]);

        dadosChat.animalId = chatAnimalId;
        dadosChat.ownerId = chatOwnerId;
        dadosChat.interessadoId = chatInteressadoId;
        dadosChat.participantes = [chatOwnerId, chatInteressadoId];
        dadosChat.interessadoNome = perfilInteressado.nome;
        dadosChat.interessadoFoto = perfilInteressado.foto || null;
        dadosChat.donoNome = perfilDono.nome;
        dadosChat.donoFoto = perfilDono.foto || null;
        dadosChat.animalNome = chatAnimalNome || 'Animal';
      }

      await setDoc(doc(db, 'chats', chatId), dadosChat, { merge: true });

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: mensagem.text,
        createdAt: serverTimestamp(),
        user: {
          _id: usuarioLogado.uid,
          name: perfilUsuarioLogado?.nome || usuarioLogado.email?.split('@')[0] || 'Usuario',
          avatar: perfilUsuarioLogado?.foto || undefined,
        },
      });
    } catch (error) {
      console.error('Erro ao salvar mensagem no Firestore:', error);
      Alert.alert('Erro', 'Nao foi possivel enviar a mensagem.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#88c9bf" />
      </View>
    );
  }

  if (!usuarioLogado) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Faca login para acessar o chat.</Text>
      </View>
    );
  }

  if (exibindoLista) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.titleHeader}>Conversas</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScrollToIndexFailed={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
          ListEmptyComponent={
            <View style={styles.centerList}>
              <Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ItemConversa
              chat={item}
              usuarioId={usuarioLogado.uid}
              onPress={() => router.push({ pathname: ROUTES.chat, params: { chatId: item.id } })}
            />
          )}
        />
      </View>
    );
  }

  const participanteHeader = outroParticipante || criarUsuarioFallback(ownerId);
  const subtituloHeader = chatAtual?.animalNome || animalNome;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <AvatarUsuario usuario={participanteHeader} tamanho={42} />
          <View style={styles.chatHeaderTexts}>
            <Text style={styles.titleHeader} numberOfLines={1}>
              {participanteHeader.nome}
            </Text>
            {!!subtituloHeader && (
              <Text style={styles.chatHeaderSubtitle} numberOfLines={1}>
                Sobre {subtituloHeader}
              </Text>
            )}
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.chatArea, { paddingBottom: insets.bottom }]}>
        <GiftedChat
          messages={messages}
          onSend={(msgs) => onSend(msgs)}
          user={{
            _id: usuarioLogado.uid,
          }}
          keyboardAvoidingViewProps={{
            keyboardVerticalOffset: CHAT_HEADER_HEIGHT,
          }}
          textInputProps={{
            placeholder: 'Digite uma mensagem...',
            placeholderTextColor: '#999',
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  chatArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerList: { padding: 24, alignItems: 'center' },
  listContent: { padding: 12 },
  emptyText: { fontSize: 15, color: '#757575', textAlign: 'center' },
  chatItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e6e7e8',
    borderLeftWidth: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatNegociacao: { borderLeftColor: '#F2C94C' },
  chatTransferencia: { borderLeftColor: '#88c9bf' },
  chatItemTexts: { flex: 1, marginLeft: 12 },
  chatItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatUserName: {
    flex: 1,
    fontSize: 16,
    color: '#434343',
    fontWeight: '600',
    marginRight: 8,
  },
  chatAnimalSmall: { maxWidth: 110, fontSize: 12, color: '#88c9bf' },
  chatType: { fontSize: 11, marginTop: 2, fontWeight: '700' },
  chatTypeNegociacao: { color: '#c79b16' },
  chatTypeTransferencia: { color: '#589b9b' },
  chatPreview: { fontSize: 14, color: '#757575', marginTop: 3 },
  avatar: { backgroundColor: '#cfe9e5' },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 18, color: '#434343', fontWeight: '700' },
  avatarInitialSmall: { fontSize: 16 },
  header: {
    backgroundColor: '#88c9bf',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 15,
    elevation: 3,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  chatHeaderTexts: { flex: 1, marginLeft: 10 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  chatHeaderSubtitle: { fontSize: 12, color: '#434343', marginTop: 2, opacity: 0.8 },
  backIcon: { fontSize: 28, color: '#434343' },
});
