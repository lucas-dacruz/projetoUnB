import { ROUTES } from '@/constants/routes';
import { auth, db } from '@/services/firebase';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Platform } from 'react-native';

type NotificationData = {
  screen?: string;
  notificationId?: string;
  notificacaoId?: string;
  chatId?: string;
  animalId?: string;
  petId?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () =>
  Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;

const navegarPorNotificacao = (data?: NotificationData) => {
  if (!data) return;

  if (data.chatId) {
    router.push({ pathname: ROUTES.chat, params: { chatId: data.chatId } });
    return;
  }

  const animalId = data.animalId || data.petId;

  if (data.screen === 'animal' && animalId) {
    router.push({ pathname: ROUTES.detalhesAnimal, params: { id: animalId } });
    return;
  }

  router.push({ pathname: ROUTES.notificacoes });
};

const registrarToken = async (uid: string) => {
  if (Platform.OS === 'web') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('adocao', {
      name: 'Adoção',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#88C9BF',
    });
  }

  const permissaoAtual = await Notifications.getPermissionsAsync();
  let status = permissaoAtual.status;

  if (status !== 'granted') {
    const novaPermissao = await Notifications.requestPermissionsAsync();
    status = novaPermissao.status;
  }

  if (status !== 'granted') return;

  const projectId = getProjectId();
  if (!projectId) return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  console.log('push debug', {
    uid,
    platform: Platform.OS,
    permissionStatus: status,
    projectId,
    token,
  });

  const usuarioRef = doc(db, 'usuarios', uid);
  const usuarioSnap = await getDoc(usuarioRef);
  const tokenAtual = usuarioSnap.exists() ? usuarioSnap.data().expoPushToken : null;

  if (tokenAtual !== token) {
    await setDoc(
      usuarioRef,
      {
        expoPushToken: token,
        expoPushTokenAtualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

export function usePushNotifications() {
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        registrarToken(user.uid).catch((error) => {
          console.log('Erro ao registrar token de notificacao:', error);
        });
      }
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      // O handler global acima decide como exibir notificacoes em foreground.
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navegarPorNotificacao(response.notification.request.content.data as NotificationData);
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        navegarPorNotificacao(response?.notification.request.content.data as NotificationData);
      })
      .catch((error) => {
        console.log('Erro ao ler notificacao inicial:', error);
      });

    return () => {
      unsubscribeAuth();
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}
