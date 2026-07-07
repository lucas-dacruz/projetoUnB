import { db } from '@/services/firebase';
import {
  collection,
  doc,
  type DocumentReference,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

type NotificacaoAdocao = {
  id: string;
  animalId?: string;
  petId?: string;
  donoId?: string;
  interessadoId?: string;
  adotanteId?: string;
  chatId?: string | null;
};

const getPetId = (notificacao: NotificacaoAdocao) => notificacao.animalId || notificacao.petId;
const getAdotanteId = (notificacao: NotificacaoAdocao) =>
  notificacao.interessadoId || notificacao.adotanteId;

export const rejeicaoAdocaoRef = (petId: string, usuarioId: string) =>
  doc(db, 'animais', petId, 'rejeicoesAdocao', usuarioId);

export const usuarioFoiRejeitadoParaPet = async (petId: string, usuarioId: string) => {
  const rejeicaoSnap = await getDoc(rejeicaoAdocaoRef(petId, usuarioId));
  return rejeicaoSnap.exists();
};

export const transferirPropriedadePet = async (
  notificacao: NotificacaoAdocao,
  chatId?: string | null,
  dadosNotificacao?: Record<string, unknown>
) => {
  const petId = getPetId(notificacao);
  const novoDonoId = getAdotanteId(notificacao);
  const donoAnteriorId = notificacao.donoId;

  if (!petId || !novoDonoId || !donoAnteriorId) {
    throw new Error('Notificacao sem dados suficientes para transferir o pet.');
  }

  const petRef = doc(db, 'animais', petId);
  const petSnap = await getDoc(petRef);

  if (!petSnap.exists()) {
    throw new Error('Pet nao encontrado para transferencia.');
  }

  const pet = petSnap.data();

  if (pet.ownerId && pet.ownerId !== donoAnteriorId && pet.ownerId !== novoDonoId) {
    throw new Error('Este pet ja pertence a outro usuario.');
  }

  const notificacoesRef = collection(db, 'notificacoes');
  const chatsRef = collection(db, 'chats');
  const [notificacoesPorAnimal, notificacoesPorPet, chatsSnap] = await Promise.all([
    getDocs(query(notificacoesRef, where('animalId', '==', petId))),
    getDocs(query(notificacoesRef, where('petId', '==', petId))),
    getDocs(query(chatsRef, where('animalId', '==', petId))),
  ]);

  const notificacoesRelacionadas = new Map<
    string,
    { ref: DocumentReference; status?: string }
  >();

  [...notificacoesPorAnimal.docs, ...notificacoesPorPet.docs].forEach((documento) => {
    notificacoesRelacionadas.set(documento.id, {
      ref: documento.ref,
      status: documento.data().status,
    });
  });

  const batch = writeBatch(db);

  batch.update(petRef, {
    ownerId: novoDonoId,
    previousOwnerId: donoAnteriorId,
    adoptedById: novoDonoId,
    adoptedAt: serverTimestamp(),
    adoptedFromNotificationId: notificacao.id,
    disponivel: false,
    updatedAt: serverTimestamp(),
  });

  notificacoesRelacionadas.forEach((notificacaoRelacionada, notificacaoId) => {
    if (notificacaoId === notificacao.id) {
      return;
    }

    const dadosRelacionados: Record<string, unknown> = {
      currentOwnerId: novoDonoId,
      previousOwnerId: donoAnteriorId,
      ownerTransferredAt: serverTimestamp(),
    };

    if (notificacaoRelacionada.status === 'pendente') {
      dadosRelacionados.status = 'encerrada';
      dadosRelacionados.statusLegado = 'encerrada';
      dadosRelacionados.mensagemAdotante = 'Este pet ja foi adotado.';
      dadosRelacionados.updatedAt = serverTimestamp();
    }

    batch.update(notificacaoRelacionada.ref, dadosRelacionados);
  });

  batch.update(doc(db, 'notificacoes', notificacao.id), {
    ...dadosNotificacao,
    currentOwnerId: novoDonoId,
    previousOwnerId: donoAnteriorId,
    ownerTransferredAt: serverTimestamp(),
  });

  chatsSnap.docs.forEach((documento) => {
    batch.update(documento.ref, {
      currentOwnerId: novoDonoId,
      previousOwnerId: donoAnteriorId,
      ownerTransferredAt: serverTimestamp(),
      animalDisponivel: false,
      updatedAt: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  });

  if (chatId) {
    batch.set(
      doc(db, 'chats', chatId),
      {
        currentOwnerId: novoDonoId,
        previousOwnerId: donoAnteriorId,
        ownerTransferredAt: serverTimestamp(),
        animalDisponivel: false,
        tipo_chat: 'transferencia',
        updatedAt: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
};
