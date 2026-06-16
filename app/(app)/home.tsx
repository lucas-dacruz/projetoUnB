import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '@/firebaseConfig';
import { collection, DocumentData, onSnapshot, query, QuerySnapshot, where } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setNotificacoesPendentes(0);
      return;
    }

    const notificacoesRef = collection(db, 'notificacoes');
    const notificacoesDonoQuery = query(
      notificacoesRef,
      where('donoId', '==', user.uid),
      where('lidaDono', '==', false)
    );
    const notificacoesAdotanteQuery = query(
      notificacoesRef,
      where('adotanteId', '==', user.uid),
      where('lidaAdotante', '==', false)
    );

    let pendentesDono = 0;
    let retornosAdotante = 0;

    const atualizarTotal = () => {
      setNotificacoesPendentes(pendentesDono + retornosAdotante);
    };

    const unsubscribeDono = onSnapshot(
      notificacoesDonoQuery,
      (snapshot) => {
        pendentesDono = snapshot.size;
        atualizarTotal();
      },
      (error) => console.log('Erro ao ouvir notificacoes:', error)
    );

    const unsubscribeAdotante = onSnapshot(
      notificacoesAdotanteQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        retornosAdotante = snapshot.docs.filter((documento) => {
          const status = documento.data().status;
          return (
            status === 'rejeitada' ||
            status === 'negociacao' ||
            status === 'aceita' ||
            status === 'recusada' ||
            status === 'em_negociacao' ||
            status === 'aprovada'
          );
        }).length;
        atualizarTotal();
      },
      (error) => console.log('Erro ao ouvir notificacoes:', error)
    );

    return () => {
      unsubscribeDono();
      unsubscribeAdotante();
    };
  }, []);

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.menu} onPress={() => navigation.openDrawer()}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => router.push('/(app)/notificacoes' as any)}
      >
        <MaterialIcons name="notifications-none" size={26} color="#6FCF97" />
        {notificacoesPendentes > 0 ? (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificacoesPendentes > 9 ? '9+' : notificacoesPendentes}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Text style={styles.title}>Olá!</Text>

      <Text style={styles.subtitle}>
        Bem vindo ao Meau!{"\n"}
        Aqui você pode adotar, doar e ajudar{"\n"}
        cães e gatos com facilidade.{"\n"}
        Qual o seu interesse?
      </Text>

      <View style={styles.buttonsContainer}>
        <CustomButton text="ADOTAR" 
        onPress={() => router.push('/adotar' as any)}/>
        <CustomButton 
          text="CADASTRAR ANIMAL"
          onPress={() => router.push('../registro-animal')}
        />
      </View>

      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={styles.login}>logout</Text>
      </TouchableOpacity>

      <Text style={styles.logo}>meau</Text>

    </View>
  );
}

function CustomButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },

  menu: {
    position: 'absolute',
    top: 60,
    left: 30,
  },

  line: {
    width: 25,
    height: 3,
    backgroundColor: '#6FCF97',
    marginVertical: 2,
  },

  notificationButton: {
    position: 'absolute',
    top: 54,
    right: 28,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EB5757',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  title: {
    marginTop: 100,
    fontSize: 52,
    fontFamily: 'Courgette_400Regular',
    color: '#F2C94C',
  },

  subtitle: {
    marginTop: 30,
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 16,
    lineHeight: 22,
    width: '100%',
  },

  buttonsContainer: {
    marginTop: 50,
    width: '80%',
    gap: 15,
  },

  button: {
    backgroundColor: '#F2C94C',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  buttonText: {
    fontWeight: 'bold',
    color: '#333',
  },

  login: {
    marginTop: 30,
    color: '#6FCF97',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },

  logo: {
    position: 'absolute',
    bottom: 40,
    fontSize: 36,
    color: '#6FCF97',
    fontWeight: 'bold',
  },
});
