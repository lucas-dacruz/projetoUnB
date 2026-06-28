const admin = require('firebase-admin');
const { logger } = require('firebase-functions');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');

admin.initializeApp();

const db = admin.firestore();
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const mensagensResposta = {
  aceita: 'Sua solicitação de adoção foi aceita.',
  negociacao: 'O responsável deseja negociar a adoção.',
  rejeitada: 'Sua solicitação de adoção foi rejeitada.',
  aprovada: 'Sua solicitação de adoção foi aceita.',
  em_negociacao: 'O responsável deseja negociar a adoção.',
  recusada: 'Sua solicitação de adoção foi rejeitada.',
};

const normalizarStatus = (status) => {
  if (status === 'aprovada') return 'aceita';
  if (status === 'em_negociacao') return 'negociacao';
  if (status === 'recusada') return 'rejeitada';
  return status;
};

const isExpoPushToken = (token) =>
  typeof token === 'string' &&
  (token.startsWith('ExpoPushToken[') || token.startsWith('ExponentPushToken['));

const getUsuario = async (uid) => {
  if (!uid) return null;

  const snapshot = await db.collection('usuarios').doc(uid).get();
  return snapshot.exists ? snapshot.data() : null;
};

const getNomeUsuario = (usuario) =>
  usuario?.nome || usuario?.usuario || usuario?.email || 'Alguém';

const enviarPush = async ({ token, title, body, data }) => {
  if (!isExpoPushToken(token)) {
    logger.info('Token Expo ausente ou invalido; push ignorado.');
    return;
  }

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      android: {
        channelId: 'adocao',
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    logger.error('Erro ao enviar push pelo Expo.', result);
    return;
  }

  logger.info('Push enviado pelo Expo.', result);
};

exports.enviarPushSolicitacaoAdocao = onDocumentCreated(
  'notificacoes/{notificacaoId}',
  async (event) => {
    const notificacao = event.data?.data();

    if (!notificacao || notificacao.tipo !== 'intencao_adocao' || notificacao.status !== 'pendente') {
      return;
    }

    const donoId = notificacao.donoId;
    const interessadoId = notificacao.interessadoId || notificacao.adotanteId;
    const [dono, interessado] = await Promise.all([
      getUsuario(donoId),
      getUsuario(interessadoId),
    ]);

    await enviarPush({
      token: dono?.expoPushToken,
      title: 'Nova solicitação de adoção',
      body: `${getNomeUsuario(interessado)} deseja adotar seu animal.`,
      data: {
        screen: 'notificacoes',
        notificationId: event.params.notificacaoId,
        notificacaoId: event.params.notificacaoId,
        animalId: notificacao.animalId || notificacao.petId || '',
        petId: notificacao.petId || notificacao.animalId || '',
      },
    });
  }
);

exports.enviarPushRespostaAdocao = onDocumentUpdated(
  'notificacoes/{notificacaoId}',
  async (event) => {
    const antes = event.data?.before.data();
    const depois = event.data?.after.data();

    if (!antes || !depois || depois.tipo !== 'intencao_adocao') {
      return;
    }

    if (antes.status === depois.status) {
      return;
    }

    const status = normalizarStatus(depois.status);
    const body = mensagensResposta[status];

    if (!body) {
      return;
    }

    const interessadoId = depois.interessadoId || depois.adotanteId;
    const interessado = await getUsuario(interessadoId);

    await enviarPush({
      token: interessado?.expoPushToken,
      title: 'Atualização da adoção',
      body,
      data: {
        screen: depois.chatId ? 'chat' : 'notificacoes',
        notificationId: event.params.notificacaoId,
        notificacaoId: event.params.notificacaoId,
        chatId: depois.chatId || '',
        animalId: depois.animalId || depois.petId || '',
        petId: depois.petId || depois.animalId || '',
      },
    });
  }
);
