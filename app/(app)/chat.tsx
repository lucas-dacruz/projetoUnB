import { auth, db } from '@/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CHAT_HEADER_HEIGHT = 90;

type ChatResumo = {
  id: string;
  animalId?: string;
  ownerId?: string;
  interessadoId?: string;
  animalNome?: string;
  ultimoTexto?: string;
  atualizadoEm?: any;
};

export default function TelaChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const usuarioLogado = auth.currentUser;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chats, setChats] = useState<ChatResumo[]>([]);
  const [loading, setLoading] = useState(true);

  const chatIdParam = params.chatId as string | undefined;
  const animalId = params.animalId as string | undefined;
  const ownerId = params.ownerId as string | undefined;
  const animalNome = params.animalNome as string | undefined;
  const interessadoId = usuarioLogado?.uid;

  const chatId = chatIdParam || (animalId && interessadoId ? `${animalId}_${interessadoId}` : null);
  const exibindoLista = !chatId;

  useEffect(() => {
    if (!usuarioLogado || !exibindoLista) {
      return;
    }

    setLoading(true);

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participantes', 'array-contains', usuarioLogado.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaChats: ChatResumo[] = [];

      querySnapshot.forEach((docSnap) => {
        listaChats.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      listaChats.sort((a, b) => {
        const dataA = a.atualizadoEm?.toMillis ? a.atualizadoEm.toMillis() : 0;
        const dataB = b.atualizadoEm?.toMillis ? b.atualizadoEm.toMillis() : 0;
        return dataB - dataA;
      });

      setChats(listaChats);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao listar chats:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [exibindoLista, usuarioLogado]);

  useEffect(() => {
    if (!usuarioLogado || !chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const mensagensRef = collection(db, 'chats', chatId, 'messages');
    const q = query(mensagensRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
          },
        });
      });

      setMessages(listaMensagens);
      setLoading(false);
    }, (error) => {
      console.error('Erro no listener do onSnapshot:', error);
      setLoading(false);
    });

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
      };

      if (animalId && ownerId && interessadoId) {
        dadosChat.animalId = animalId;
        dadosChat.ownerId = ownerId;
        dadosChat.interessadoId = interessadoId;
        dadosChat.participantes = [ownerId, interessadoId];
        dadosChat.animalNome = animalNome || 'Animal';
      }

      await setDoc(doc(db, 'chats', chatId), dadosChat, { merge: true });

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: mensagem.text,
        createdAt: serverTimestamp(),
        user: {
          _id: usuarioLogado.uid,
          name: usuarioLogado.email?.split('@')[0] || 'Usuario',
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
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titleHeader}>Conversas</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerList}>
              <Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => router.push({ pathname: '/(app)/chat', params: { chatId: item.id } })}
            >
              <Text style={styles.chatAnimal}>{item.animalNome || 'Animal'}</Text>
              <Text style={styles.chatPreview}>{item.ultimoTexto || 'Conversa iniciada'}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Chat de Adoção</Text>
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
    padding: 14,
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e6e7e8',
  },
  chatAnimal: { fontSize: 16, color: '#434343', fontWeight: '600', marginBottom: 4 },
  chatPreview: { fontSize: 14, color: '#757575' },
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
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  backIcon: { fontSize: 28, color: '#434343' },
});
